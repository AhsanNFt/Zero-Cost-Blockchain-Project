import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { credentials, verifications, type InsertCredential } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { CONTRACT_ADDRESS } from "@contracts/abi/SkillChainCredential";

export const credentialRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        owner: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = input.owner
        ? eq(credentials.recipientAddress, input.owner)
        : undefined;

      const items = await db
        .select()
        .from(credentials)
        .where(conditions)
        .orderBy(desc(credentials.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(credentials)
        .where(conditions);

      return {
        items,
        total: countResult[0]?.count ?? 0,
      };
    }),

  getByTokenId: publicQuery
    .input(z.object({ tokenId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(credentials)
        .where(eq(credentials.tokenId, input.tokenId))
        .limit(1);

      return result[0] ?? null;
    }),

  issue: publicQuery
    .input(
      z.object({
        tokenId: z.number(),
        recipient: z.string(),
        issuer: z.string(),
        name: z.string(),
        institution: z.string(),
        credentialType: z.enum(["course", "bootcamp", "workshop", "certification", "skillbadge"]),
        description: z.string().optional(),
        metadataUri: z.string(),
        imageCid: z.string().optional(),
        issueDate: z.string(),
        expiryDate: z.string().optional(),
        transactionHash: z.string(),
        blockNumber: z.number().optional(),
        chainId: z.number().optional(),
        networkName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const values: InsertCredential = {
        tokenId: input.tokenId,
        contractAddress: CONTRACT_ADDRESS,
        recipientAddress: input.recipient,
        issuerAddress: input.issuer,
        name: input.name,
        institution: input.institution,
        credentialType: input.credentialType,
        metadataUri: input.metadataUri,
        issueDate: new Date(input.issueDate),
        transactionHash: input.transactionHash,
        chainId: input.chainId ?? 11155111,
        networkName: input.networkName ?? "Ethereum Sepolia",
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.imageCid !== undefined ? { imageCid: input.imageCid } : {}),
        ...(input.expiryDate !== undefined
          ? { expiryDate: new Date(input.expiryDate) }
          : {}),
        ...(input.blockNumber !== undefined ? { blockNumber: input.blockNumber } : {}),
      };

      const result = await db.insert(credentials).values(values);

      return { success: true, id: Number(result[0].insertId) };
    }),

  verify: publicQuery
    .input(z.object({ tokenId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const cred = await db
        .select()
        .from(credentials)
        .where(eq(credentials.tokenId, input.tokenId))
        .limit(1);

      const isValid = cred.length > 0 && !cred[0].isRevoked;

      // Log verification
      await db.insert(verifications).values({
        credentialId: cred[0]?.id ?? 0,
        isValid,
      });

      return { isValid, credential: cred[0] ?? null };
    }),

  getStats: publicQuery.query(async () => {
    const db = getDb();
    const issuedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(credentials);

    const verificationResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(verifications);

    const issuerResult = await db
      .select({
        count: sql<number>`count(distinct ${credentials.issuerAddress})`,
      })
      .from(credentials);

    return {
      totalIssued: issuedResult[0]?.count ?? 0,
      totalVerified: verificationResult[0]?.count ?? 0,
      totalIssuers: issuerResult[0]?.count ?? 0,
    };
  }),
});
