import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { credentials, verifications } from "@db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { ethers } from "ethers";
import { SKILLCHAIN_CONTRACT_ADDRESS, SKILLCHAIN_ABI } from "@contracts/constants";
import { env } from "./lib/env";

/**
 * Employer API Router
 * Provides REST-like endpoints for HR systems and ATS integrations
 */

export const employerRouter = createRouter({
  /**
   * Verify a single credential by token ID
   * Use case: Quick verification during interview process
   */
  verifySingle: publicQuery
    .input(
      z.object({
        tokenId: z.number().int().positive(),
        verifierAddress: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      try {
        // 1. Get credential from database
        const credential = await db.query.credentials.findFirst({
          where: eq(credentials.tokenId, input.tokenId),
        });

        if (!credential) {
          return {
            success: false,
            error: "Credential not found",
            tokenId: input.tokenId,
          };
        }

        // 2. Verify on blockchain
        const provider = new ethers.JsonRpcProvider(
          env.ALCHEMY_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo"
        );
        const contract = new ethers.Contract(
          SKILLCHAIN_CONTRACT_ADDRESS,
          SKILLCHAIN_ABI,
          provider
        );

        const onChainData = await contract.verifyCredential(input.tokenId);

        // 3. Log verification attempt
        await db.insert(verifications).values({
          credentialId: credential.id,
          verifierAddress: input.verifierAddress || null,
          isValid: !credential.isRevoked && !onChainData.isRevoked,
          verifiedAt: new Date(),
        });

        // 4. Return comprehensive verification result
        return {
          success: true,
          tokenId: input.tokenId,
          isValid: !credential.isRevoked && !onChainData.isRevoked,
          credential: {
            name: credential.name,
            institution: credential.institution,
            credentialType: credential.credentialType,
            description: credential.description,
            issueDate: credential.issueDate,
            expiryDate: credential.expiryDate,
            recipientAddress: credential.recipientAddress,
            issuerAddress: credential.issuerAddress,
            isRevoked: credential.isRevoked,
            transactionHash: credential.transactionHash,
            network: credential.network,
            metadataUri: credential.metadataUri,
          },
          blockchain: {
            verified: true,
            issuer: onChainData.issuer,
            owner: onChainData.ownerAddress,
            issueTimestamp: Number(onChainData.issueTimestamp),
            isRevoked: onChainData.isRevoked,
          },
          verifiedAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error("Verification error:", error);
        return {
          success: false,
          error: "Verification failed",
          tokenId: input.tokenId,
          details: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Batch verify multiple credentials
   * Use case: Bulk verification for applicant screening
   */
  verifyBatch: publicQuery
    .input(
      z.object({
        tokenIds: z.array(z.number().int().positive()).max(50), // Limit to 50 per request
        verifierAddress: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const results = [];

      for (const tokenId of input.tokenIds) {
        try {
          const credential = await db.query.credentials.findFirst({
            where: eq(credentials.tokenId, tokenId),
          });

          if (!credential) {
            results.push({
              tokenId,
              success: false,
              error: "Credential not found",
            });
            continue;
          }

          // Verify on blockchain
          const provider = new ethers.JsonRpcProvider(
            env.ALCHEMY_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo"
          );
          const contract = new ethers.Contract(
            SKILLCHAIN_CONTRACT_ADDRESS,
            SKILLCHAIN_ABI,
            provider
          );

          const onChainData = await contract.verifyCredential(tokenId);
          const isValid = !credential.isRevoked && !onChainData.isRevoked;

          // Log verification
          await db.insert(verifications).values({
            credentialId: credential.id,
            verifierAddress: input.verifierAddress || null,
            isValid,
            verifiedAt: new Date(),
          });

          results.push({
            tokenId,
            success: true,
            isValid,
            name: credential.name,
            institution: credential.institution,
            credentialType: credential.credentialType,
            issueDate: credential.issueDate,
            recipientAddress: credential.recipientAddress,
            isRevoked: credential.isRevoked,
          });
        } catch (error) {
          results.push({
            tokenId,
            success: false,
            error: error instanceof Error ? error.message : "Verification failed",
          });
        }
      }

      return {
        success: true,
        totalRequested: input.tokenIds.length,
        totalVerified: results.filter((r) => r.success).length,
        results,
        verifiedAt: new Date().toISOString(),
      };
    }),

  /**
   * Get all credentials for a wallet address
   * Use case: View candidate's complete credential portfolio
   */
  getByWallet: publicQuery
    .input(
      z.object({
        walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
        includeRevoked: z.boolean().default(false),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(credentials.recipientAddress, input.walletAddress.toLowerCase())];

      if (!input.includeRevoked) {
        conditions.push(eq(credentials.isRevoked, false));
      }

      const userCredentials = await db.query.credentials.findMany({
        where: and(...conditions),
        orderBy: (credentials, { desc }) => [desc(credentials.issueDate)],
      });

      return {
        success: true,
        walletAddress: input.walletAddress,
        totalCredentials: userCredentials.length,
        credentials: userCredentials.map((cred) => ({
          tokenId: cred.tokenId,
          name: cred.name,
          institution: cred.institution,
          credentialType: cred.credentialType,
          description: cred.description,
          issueDate: cred.issueDate,
          expiryDate: cred.expiryDate,
          isRevoked: cred.isRevoked,
          transactionHash: cred.transactionHash,
          metadataUri: cred.metadataUri,
        })),
      };
    }),

  /**
   * Get credentials by institution
   * Use case: Verify all credentials from a specific institution
   */
  getByInstitution: publicQuery
    .input(
      z.object({
        institution: z.string().min(1),
        limit: z.number().int().positive().max(100).default(20),
        offset: z.number().int().nonnegative().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const institutionCredentials = await db.query.credentials.findMany({
        where: eq(credentials.institution, input.institution),
        limit: input.limit,
        offset: input.offset,
        orderBy: (credentials, { desc }) => [desc(credentials.createdAt)],
      });

      const total = await db
        .select({ count: credentials.id })
        .from(credentials)
        .where(eq(credentials.institution, input.institution));

      return {
        success: true,
        institution: input.institution,
        total: total.length,
        limit: input.limit,
        offset: input.offset,
        credentials: institutionCredentials,
      };
    }),

  /**
   * Get verification statistics
   * Use case: Analytics for employers and institutions
   */
  getStats: publicQuery
    .input(
      z.object({
        walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
        institution: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      let credentialQuery = db.select().from(credentials);
      let verificationQuery = db.select().from(verifications);

      if (input.walletAddress) {
        credentialQuery = credentialQuery.where(
          eq(credentials.recipientAddress, input.walletAddress.toLowerCase())
        );
      }

      if (input.institution) {
        credentialQuery = credentialQuery.where(eq(credentials.institution, input.institution));
      }

      const allCredentials = await credentialQuery;
      const allVerifications = await verificationQuery;

      const credentialIds = allCredentials.map((c) => c.id);
      const relevantVerifications = allVerifications.filter((v) =>
        credentialIds.includes(Number(v.credentialId))
      );

      return {
        success: true,
        stats: {
          totalCredentials: allCredentials.length,
          activeCredentials: allCredentials.filter((c) => !c.isRevoked).length,
          revokedCredentials: allCredentials.filter((c) => c.isRevoked).length,
          totalVerifications: relevantVerifications.length,
          credentialTypes: allCredentials.reduce((acc, cred) => {
            acc[cred.credentialType] = (acc[cred.credentialType] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        },
      };
    }),

  /**
   * Search credentials by skill/name
   * Use case: Find candidates with specific skills
   */
  search: publicQuery
    .input(
      z.object({
        query: z.string().min(1),
        credentialType: z
          .enum(["course", "bootcamp", "workshop", "certification", "skillbadge"])
          .optional(),
        limit: z.number().int().positive().max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      // Simple search implementation - can be enhanced with full-text search
      const allCredentials = await db.query.credentials.findMany({
        limit: input.limit,
      });

      const filtered = allCredentials.filter((cred) => {
        const matchesQuery =
          cred.name.toLowerCase().includes(input.query.toLowerCase()) ||
          cred.description?.toLowerCase().includes(input.query.toLowerCase()) ||
          cred.institution.toLowerCase().includes(input.query.toLowerCase());

        const matchesType = input.credentialType
          ? cred.credentialType === input.credentialType
          : true;

        return matchesQuery && matchesType && !cred.isRevoked;
      });

      return {
        success: true,
        query: input.query,
        totalResults: filtered.length,
        credentials: filtered.map((cred) => ({
          tokenId: cred.tokenId,
          name: cred.name,
          institution: cred.institution,
          credentialType: cred.credentialType,
          description: cred.description,
          issueDate: cred.issueDate,
          recipientAddress: cred.recipientAddress,
        })),
      };
    }),
});
