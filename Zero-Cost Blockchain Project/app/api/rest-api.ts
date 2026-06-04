import { Hono } from "hono";
import { cors } from "hono/cors";
import { getDb } from "./queries/connection";
import { credentials, verifications, walletUsers } from "@db/schema";
import { eq, and, inArray, desc, sql } from "drizzle-orm";

/**
 * REST API for Employer Integrations
 * Provides traditional REST endpoints for ATS systems and HR platforms
 * 
 * Base URL: /api/v1/employer
 */

const app = new Hono();

// Enable CORS for external integrations
app.use("/*", cors({
  origin: "*", // Configure based on your needs
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "X-API-Key"],
}));

// API Key middleware (optional - implement based on your auth strategy)
app.use("/*", async (c, next) => {
  const apiKey = c.req.header("X-API-Key");
  
  // TODO: Implement API key validation
  // For now, allow all requests (public API)
  // In production, validate against a database of API keys
  
  await next();
});

/**
 * POST /api/v1/employer/verify/batch
 * Verify multiple credentials at once
 * 
 * Request Body:
 * {
 *   "tokenIds": [1, 2, 3],
 *   "verifierAddress": "0x...",
 *   "includeMetadata": true
 * }
 */
app.post("/verify/batch", async (c) => {
  const db = getDb();
  try {
    const body = await c.req.json();
    const { tokenIds, verifierAddress, includeMetadata = true } = body;

    if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
      return c.json({ error: "tokenIds array is required" }, 400);
    }

    if (tokenIds.length > 100) {
      return c.json({ error: "Maximum 100 credentials per batch" }, 400);
    }

    // Fetch credentials
    const credentialRecords = await db
      .select()
      .from(credentials)
      .where(inArray(credentials.tokenId, tokenIds));

    // Log verifications
    if (verifierAddress) {
      const verificationLogs = tokenIds.map((tokenId) => ({
        credentialId: BigInt(tokenId),
        verifierAddress,
        isValid: credentialRecords.some((c) => c.tokenId === tokenId && !c.isRevoked),
        verifiedAt: new Date(),
      }));

      await db.insert(verifications).values(verificationLogs);
    }

    // Build response
    const results = tokenIds.map((tokenId) => {
      const credential = credentialRecords.find((c) => c.tokenId === tokenId);

      if (!credential) {
        return {
          tokenId,
          isValid: false,
          exists: false,
          error: "Credential not found",
        };
      }

      const baseResult = {
        tokenId,
        isValid: !credential.isRevoked,
        exists: true,
        isRevoked: credential.isRevoked,
        recipientAddress: credential.recipientAddress,
        issuerAddress: credential.issuerAddress,
        institution: credential.institution,
        credentialType: credential.credentialType,
        issueDate: credential.issueDate,
        expiryDate: credential.expiryDate,
        transactionHash: credential.transactionHash,
        network: credential.network,
      };

      if (includeMetadata) {
        return {
          ...baseResult,
          name: credential.name,
          description: credential.description,
          metadataUri: credential.metadataUri,
          imageCid: credential.imageCid,
        };
      }

      return baseResult;
    });

    return c.json({
      success: true,
      totalRequested: tokenIds.length,
      totalFound: credentialRecords.length,
      totalValid: results.filter((r) => r.isValid).length,
      results,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Batch verification error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * GET /api/v1/employer/verify/recipient/:address
 * Get all credentials for a recipient address
 */
app.get("/verify/recipient/:address", async (c) => {
  const db = getDb();
  try {
    const recipientAddress = c.req.param("address");
    const includeRevoked = c.req.query("includeRevoked") === "true";
    const credentialType = c.req.query("type");

    let query = db
      .select()
      .from(credentials)
      .where(eq(credentials.recipientAddress, recipientAddress));

    let results = await query;

    // Filter by type if specified
    if (credentialType) {
      results = results.filter((c) => c.credentialType === credentialType);
    }

    // Filter out revoked if not requested
    if (!includeRevoked) {
      results = results.filter((c) => !c.isRevoked);
    }

    // Group by type
    const groupedByType = results.reduce((acc, cred) => {
      const type = cred.credentialType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(cred);
      return acc;
    }, {} as Record<string, typeof results>);

    return c.json({
      success: true,
      recipientAddress,
      totalCredentials: results.length,
      validCredentials: results.filter((c) => !c.isRevoked).length,
      revokedCredentials: results.filter((c) => c.isRevoked).length,
      credentialsByType: groupedByType,
      credentials: results.map((cred) => ({
        tokenId: cred.tokenId,
        name: cred.name,
        institution: cred.institution,
        credentialType: cred.credentialType,
        issueDate: cred.issueDate,
        expiryDate: cred.expiryDate,
        isRevoked: cred.isRevoked,
        transactionHash: cred.transactionHash,
        metadataUri: cred.metadataUri,
      })),
    });
  } catch (error) {
    console.error("Recipient verification error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * GET /api/v1/employer/verify/:tokenId
 * Verify a single credential
 */
app.get("/verify/:tokenId", async (c) => {
  const db = getDb();
  try {
    const tokenId = parseInt(c.req.param("tokenId"));
    const verifierAddress = c.req.query("verifier");

    if (isNaN(tokenId)) {
      return c.json({ error: "Invalid token ID" }, 400);
    }

    const credential = await db
      .select()
      .from(credentials)
      .where(eq(credentials.tokenId, tokenId))
      .limit(1);

    if (credential.length === 0) {
      return c.json({
        success: false,
        exists: false,
        error: "Credential not found",
      }, 404);
    }

    const cred = credential[0];

    // Log verification
    if (verifierAddress) {
      await db.insert(verifications).values({
        credentialId: BigInt(tokenId),
        verifierAddress,
        isValid: !cred.isRevoked,
        verifiedAt: new Date(),
      });
    }

    return c.json({
      success: true,
      exists: true,
      isValid: !cred.isRevoked,
      credential: {
        tokenId: cred.tokenId,
        name: cred.name,
        institution: cred.institution,
        credentialType: cred.credentialType,
        description: cred.description,
        recipientAddress: cred.recipientAddress,
        issuerAddress: cred.issuerAddress,
        issueDate: cred.issueDate,
        expiryDate: cred.expiryDate,
        isRevoked: cred.isRevoked,
        transactionHash: cred.transactionHash,
        network: cred.network,
        metadataUri: cred.metadataUri,
        imageCid: cred.imageCid,
        createdAt: cred.createdAt,
      },
    });
  } catch (error) {
    console.error("Single verification error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * GET /api/v1/employer/search
 * Search credentials with filters
 * 
 * Query params:
 * - recipient: wallet address
 * - institution: institution name (partial match)
 * - type: credential type
 * - skill: skill name (partial match)
 * - issuedAfter: ISO date
 * - issuedBefore: ISO date
 * - limit: max results (default 20, max 100)
 * - offset: pagination offset
 */
app.get("/search", async (c) => {
  const db = getDb();
  try {
    const recipientAddress = c.req.query("recipient");
    const institution = c.req.query("institution");
    const credentialType = c.req.query("type");
    const skillName = c.req.query("skill");
    const issuedAfter = c.req.query("issuedAfter");
    const issuedBefore = c.req.query("issuedBefore");
    const limit = Math.min(parseInt(c.req.query("limit") || "20"), 100);
    const offset = parseInt(c.req.query("offset") || "0");

    let query = db.select().from(credentials);

    // Build conditions
    const conditions = [];
    if (recipientAddress) {
      conditions.push(eq(credentials.recipientAddress, recipientAddress));
    }
    if (institution) {
      conditions.push(sql`${credentials.institution} LIKE ${`%${institution}%`}`);
    }
    if (credentialType) {
      conditions.push(eq(credentials.credentialType, credentialType as any));
    }
    if (skillName) {
      conditions.push(sql`${credentials.name} LIKE ${`%${skillName}%`}`);
    }
    if (issuedAfter) {
      conditions.push(sql`${credentials.issueDate} >= ${issuedAfter}`);
    }
    if (issuedBefore) {
      conditions.push(sql`${credentials.issueDate} <= ${issuedBefore}`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Get total count
    const totalQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(credentials)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = totalQuery[0]?.count || 0;

    // Apply pagination
    const results = await query
      .orderBy(desc(credentials.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({
      success: true,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
      results: results.map((cred) => ({
        tokenId: cred.tokenId,
        name: cred.name,
        institution: cred.institution,
        credentialType: cred.credentialType,
        recipientAddress: cred.recipientAddress,
        issuerAddress: cred.issuerAddress,
        issueDate: cred.issueDate,
        expiryDate: cred.expiryDate,
        isRevoked: cred.isRevoked,
        transactionHash: cred.transactionHash,
      })),
    });
  } catch (error) {
    console.error("Search error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * GET /api/v1/employer/issuer/:address/stats
 * Get statistics for an issuer
 */
app.get("/issuer/:address/stats", async (c) => {
  const db = getDb();
  try {
    const issuerAddress = c.req.param("address");

    // Get issuer info
    const issuerInfo = await db
      .select()
      .from(walletUsers)
      .where(eq(walletUsers.walletAddress, issuerAddress))
      .limit(1);

    // Get statistics
    const stats = await db
      .select({
        total: sql<number>`count(*)`,
        revoked: sql<number>`sum(case when ${credentials.isRevoked} then 1 else 0 end)`,
        byType: sql<string>`${credentials.credentialType}`,
        typeCount: sql<number>`count(*)`,
      })
      .from(credentials)
      .where(eq(credentials.issuerAddress, issuerAddress))
      .groupBy(credentials.credentialType);

    const totalIssued = stats.reduce((sum, s) => sum + s.typeCount, 0);
    const totalRevoked = stats.reduce((sum, s) => sum + (s.revoked || 0), 0);

    // Recent credentials
    const recentCredentials = await db
      .select({
        tokenId: credentials.tokenId,
        name: credentials.name,
        credentialType: credentials.credentialType,
        issueDate: credentials.issueDate,
        isRevoked: credentials.isRevoked,
      })
      .from(credentials)
      .where(eq(credentials.issuerAddress, issuerAddress))
      .orderBy(desc(credentials.createdAt))
      .limit(10);

    return c.json({
      success: true,
      issuerAddress,
      issuerInfo: issuerInfo[0] || null,
      statistics: {
        totalIssued,
        totalRevoked,
        activeCredentials: totalIssued - totalRevoked,
        revocationRate: totalIssued > 0 ? (totalRevoked / totalIssued) * 100 : 0,
        byType: stats.map((s) => ({
          type: s.byType,
          count: s.typeCount,
          revoked: s.revoked || 0,
        })),
      },
      recentCredentials,
    });
  } catch (error) {
    console.error("Issuer stats error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * GET /api/v1/employer/stats
 * Get platform-wide statistics
 */
app.get("/stats", async (c) => {
  const db = getDb();
  try {
    const [credStats, issuerStats, verificationStats] = await Promise.all([
      db
        .select({
          total: sql<number>`count(*)`,
          revoked: sql<number>`sum(case when ${credentials.isRevoked} then 1 else 0 end)`,
          byType: credentials.credentialType,
          typeCount: sql<number>`count(*)`,
        })
        .from(credentials)
        .groupBy(credentials.credentialType),

      db
        .select({
          totalIssuers: sql<number>`count(*)`,
          authorizedIssuers: sql<number>`sum(case when ${walletUsers.isAuthorizedIssuer} then 1 else 0 end)`,
        })
        .from(walletUsers),

      db
        .select({
          totalVerifications: sql<number>`count(*)`,
        })
        .from(verifications),
    ]);

    const totalCredentials = credStats.reduce((sum, s) => sum + s.typeCount, 0);
    const totalRevoked = credStats.reduce((sum, s) => sum + (s.revoked || 0), 0);

    return c.json({
      success: true,
      credentials: {
        total: totalCredentials,
        active: totalCredentials - totalRevoked,
        revoked: totalRevoked,
        byType: credStats.map((s) => ({
          type: s.byType,
          count: s.typeCount,
        })),
      },
      issuers: {
        total: issuerStats[0]?.totalIssuers || 0,
        authorized: issuerStats[0]?.authorizedIssuers || 0,
      },
      verifications: {
        total: verificationStats[0]?.totalVerifications || 0,
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Platform stats error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * GET /api/v1/employer/health
 * Health check endpoint
 */
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

export default app;
