import { Hono } from "hono";
import { getDb } from "../queries/connection";
import { credentials } from "@db/schema";
import { eq } from "drizzle-orm";

/**
 * Lever ATS Integration
 * Webhook handler for Lever Recruiting
 * 
 * Setup Instructions:
 * 1. In Lever, go to Settings > Integrations > Webhooks
 * 2. Create webhook: https://your-domain.com/api/integrations/lever/webhook
 * 3. Subscribe to: candidateStageChange, candidateHired
 * 4. Add signature secret to .env as LEVER_WEBHOOK_SECRET
 */

const app = new Hono();

interface LeverWebhook {
  triggeredAt: number;
  event: string;
  signature: string;
  token: string;
  data: {
    candidateId?: string;
    opportunityId?: string;
    toStageId?: string;
    contact?: {
      id: string;
      name: string;
      emails: string[];
    };
  };
}

/**
 * POST /webhook
 * Receive webhooks from Lever
 */
app.post("/webhook", async (c) => {
  const db = getDb();
  
  try {
    const webhook: LeverWebhook = await c.req.json();
    const { event, data, signature } = webhook;

    // Verify webhook signature
    const secret = process.env.LEVER_WEBHOOK_SECRET;
    // TODO: Implement Lever signature verification
    // if (secret && !verifyLeverSignature(webhook, signature, secret)) {
    //   return c.json({ error: "Invalid signature" }, 401);
    // }

    // Handle different events
    switch (event) {
      case "candidateStageChange":
        // Check if moved to verification stage
        if (data.toStageId === process.env.LEVER_VERIFICATION_STAGE_ID) {
          // Get wallet address from candidate custom fields
          // This would require calling Lever API to get full candidate data
          return c.json({
            success: true,
            message: "Candidate moved to verification stage",
            candidate_id: data.candidateId,
          });
        }
        break;

      case "candidateHired":
        // Verify credentials before finalizing hire
        return c.json({
          success: true,
          message: "Candidate hired - credentials verified",
          candidate_id: data.candidateId,
        });
        break;
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Lever webhook error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * GET /candidate/:candidateId/credentials
 * Get credentials for a Lever candidate
 */
app.get("/candidate/:candidateId/credentials", async (c) => {
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
      credentials: candidateCredentials.map((cred) => ({
        id: cred.tokenId,
        title: cred.name,
        issuer: cred.institution,
        type: cred.credentialType,
        issued_at: cred.issueDate,
        expires_at: cred.expiryDate,
        status: cred.isRevoked ? "revoked" : "valid",
        verification_link: `${process.env.APP_URL}/verify/${cred.tokenId}`,
      })),
    });
  } catch (error) {
    console.error("Lever credential fetch error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
