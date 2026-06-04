import { Hono } from "hono";
import { getDb } from "../queries/connection";
import { credentials } from "@db/schema";
import { eq, inArray } from "drizzle-orm";

/**
 * Greenhouse ATS Integration
 * Webhook handler for Greenhouse Recruiting
 * 
 * Setup Instructions:
 * 1. In Greenhouse, go to Configure > Dev Center > Web Hooks
 * 2. Create new webhook pointing to: https://your-domain.com/api/integrations/greenhouse/webhook
 * 3. Select events: candidate_stage_change, application_created
 * 4. Add your secret key to .env as GREENHOUSE_SECRET_KEY
 */

const app = new Hono();

interface GreenhouseWebhook {
  action: string;
  payload: {
    application?: {
      id: number;
      candidate_id: number;
      job_id: number;
      status: string;
      current_stage?: {
        id: number;
        name: string;
      };
    };
    candidate?: {
      id: number;
      first_name: string;
      last_name: string;
      email_addresses: Array<{ value: string; type: string }>;
      custom_fields?: {
        wallet_address?: string;
      };
    };
  };
}

/**
 * POST /webhook
 * Receive webhooks from Greenhouse
 */
app.post("/webhook", async (c) => {
  const db = getDb();
  
  try {
    // Verify webhook signature (optional but recommended)
    const signature = c.req.header("Greenhouse-Signature");
    const secret = process.env.GREENHOUSE_SECRET_KEY;
    
    // TODO: Implement signature verification
    // if (secret && signature) {
    //   const isValid = verifySignature(await c.req.text(), signature, secret);
    //   if (!isValid) return c.json({ error: "Invalid signature" }, 401);
    // }

    const webhook: GreenhouseWebhook = await c.req.json();
    const { action, payload } = webhook;

    // Handle different webhook events
    switch (action) {
      case "candidate_stage_change":
        // When candidate moves to "Credential Verification" stage
        if (payload.application?.current_stage?.name === "Credential Verification") {
          const walletAddress = payload.candidate?.custom_fields?.wallet_address;
          
          if (!walletAddress) {
            return c.json({
              success: false,
              message: "No wallet address found for candidate",
            });
          }

          // Fetch candidate's credentials
          const candidateCredentials = await db
            .select()
            .from(credentials)
            .where(eq(credentials.recipientAddress, walletAddress.toLowerCase()));

          // Return verification results
          return c.json({
            success: true,
            candidate_id: payload.candidate?.id,
            wallet_address: walletAddress,
            total_credentials: candidateCredentials.length,
            valid_credentials: candidateCredentials.filter((c) => !c.isRevoked).length,
            credentials: candidateCredentials.map((cred) => ({
              token_id: cred.tokenId,
              name: cred.name,
              institution: cred.institution,
              type: cred.credentialType,
              issue_date: cred.issueDate,
              is_valid: !cred.isRevoked,
              verification_url: `${process.env.APP_URL || "http://localhost:3002"}/verify/${cred.tokenId}`,
            })),
          });
        }
        break;

      case "application_created":
        // Auto-verify credentials when application is created
        const walletAddress = payload.candidate?.custom_fields?.wallet_address;
        
        if (walletAddress) {
          const candidateCredentials = await db
            .select()
            .from(credentials)
            .where(eq(credentials.recipientAddress, walletAddress.toLowerCase()));

          return c.json({
            success: true,
            auto_verified: true,
            total_credentials: candidateCredentials.length,
            valid_credentials: candidateCredentials.filter((c) => !c.isRevoked).length,
          });
        }
        break;
    }

    return c.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Greenhouse webhook error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * GET /verify-candidate/:candidateId
 * Manual verification endpoint for Greenhouse UI
 */
app.get("/verify-candidate/:candidateId", async (c) => {
  const db = getDb();
  
  try {
    const candidateId = c.req.param("candidateId");
    const walletAddress = c.req.query("wallet");

    if (!walletAddress) {
      return c.json({ error: "Wallet address required" }, 400);
    }

    const candidateCredentials = await db
      .select()
      .from(credentials)
      .where(eq(credentials.recipientAddress, walletAddress.toLowerCase()));

    return c.json({
      success: true,
      candidate_id: candidateId,
      wallet_address: walletAddress,
      verification_summary: {
        total: candidateCredentials.length,
        valid: candidateCredentials.filter((c) => !c.isRevoked).length,
        revoked: candidateCredentials.filter((c) => c.isRevoked).length,
        by_type: candidateCredentials.reduce((acc, cred) => {
          acc[cred.credentialType] = (acc[cred.credentialType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
      credentials: candidateCredentials.map((cred) => ({
        token_id: cred.tokenId,
        name: cred.name,
        institution: cred.institution,
        credential_type: cred.credentialType,
        description: cred.description,
        issue_date: cred.issueDate,
        expiry_date: cred.expiryDate,
        is_valid: !cred.isRevoked,
        transaction_hash: cred.transactionHash,
        verification_url: `${process.env.APP_URL || "http://localhost:3002"}/verify/${cred.tokenId}`,
        blockchain_explorer: `https://sepolia.etherscan.io/tx/${cred.transactionHash}`,
      })),
    });
  } catch (error) {
    console.error("Candidate verification error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * POST /bulk-verify
 * Bulk verify multiple candidates at once
 */
app.post("/bulk-verify", async (c) => {
  const db = getDb();
  
  try {
    const body = await c.req.json();
    const { candidates } = body; // Array of { candidate_id, wallet_address }

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return c.json({ error: "Candidates array required" }, 400);
    }

    const results = await Promise.all(
      candidates.map(async (candidate) => {
        try {
          const candidateCredentials = await db
            .select()
            .from(credentials)
            .where(eq(credentials.recipientAddress, candidate.wallet_address.toLowerCase()));

          return {
            candidate_id: candidate.candidate_id,
            wallet_address: candidate.wallet_address,
            success: true,
            total_credentials: candidateCredentials.length,
            valid_credentials: candidateCredentials.filter((c) => !c.isRevoked).length,
            has_credentials: candidateCredentials.length > 0,
          };
        } catch (error) {
          return {
            candidate_id: candidate.candidate_id,
            wallet_address: candidate.wallet_address,
            success: false,
            error: "Verification failed",
          };
        }
      })
    );

    return c.json({
      success: true,
      total_candidates: candidates.length,
      verified: results.filter((r) => r.success).length,
      results,
    });
  } catch (error) {
    console.error("Bulk verification error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
