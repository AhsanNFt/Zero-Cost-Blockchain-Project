/**
 * Greenhouse ATS Integration
 * Webhook handler and API integration for Greenhouse Recruiting
 * https://developers.greenhouse.io/
 */

import { Hono } from "hono";
import { getDb } from "../api/queries/connection";
import { credentials } from "@db/schema";
import { eq } from "drizzle-orm";

const app = new Hono();

/**
 * Greenhouse Webhook Events
 */
export interface GreenhouseWebhook {
  action: string;
  payload: {
    application?: {
      id: number;
      candidate_id: number;
      job_id: number;
      status: string;
      custom_fields?: Record<string, any>;
    };
    candidate?: {
      id: number;
      first_name: string;
      last_name: string;
      email_addresses: Array<{ value: string; type: string }>;
      phone_numbers: Array<{ value: string; type: string }>;
      custom_fields?: Record<string, any>;
    };
  };
}

/**
 * POST /integrations/greenhouse/webhook
 * Handle Greenhouse webhooks
 */
app.post("/webhook", async (c) => {
  try {
    const webhook: GreenhouseWebhook = await c.req.json();
    const db = getDb();

    // Verify webhook signature (implement based on Greenhouse docs)
    const signature = c.req.header("Greenhouse-Signature");
    // TODO: Verify signature

    // Handle different webhook actions
    switch (webhook.action) {
      case "application_created":
      case "application_updated":
        // When application is created/updated, check for wallet address in custom fields
        const walletAddress = webhook.payload.application?.custom_fields?.wallet_address;

        if (walletAddress) {
          // Fetch credentials for this wallet
          const candidateCredentials = await db
            .select()
            .from(credentials)
            .where(eq(credentials.recipientAddress, walletAddress.toLowerCase()));

          // Return credentials to Greenhouse via API
          // (This would typically be done via Greenhouse API, not webhook response)
          return c.json({
            success: true,
            message: "Credentials fetched",
            credentials: candidateCredentials.map((cred) => ({
              tokenId: cred.tokenId,
              name: cred.name,
              institution: cred.institution,
              type: cred.credentialType,
              issueDate: cred.issueDate,
              isValid: !cred.isRevoked,
              verificationUrl: `https://skillchain.io/verify/${cred.tokenId}`,
            })),
          });
        }
        break;

      case "candidate_stage_change":
        // When candidate moves to "Background Check" stage, auto-verify credentials
        // Implementation depends on your workflow
        break;

      default:
        console.log(`Unhandled webhook action: ${webhook.action}`);
    }

    return c.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Greenhouse webhook error:", error);
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});

/**
 * GET /integrations/greenhouse/candidate/:candidateId/credentials
 * Fetch credentials for a Greenhouse candidate
 */
app.get("/candidate/:candidateId/credentials", async (c) => {
  try {
    const candidateId = c.req.param("candidateId");
    const walletAddress = c.req.query("wallet");

    if (!walletAddress) {
      return c.json({ error: "Wallet address required" }, 400);
    }

    const db = getDb();
    const candidateCredentials = await db
      .select()
      .from(credentials)
      .where(eq(credentials.recipientAddress, walletAddress.toLowerCase()));

    // Format for Greenhouse
    const formattedCredentials = candidateCredentials.map((cred) => ({
      id: cred.tokenId,
      name: cred.name,
      institution: cred.institution,
      type: cred.credentialType,
      issueDate: cred.issueDate,
      expiryDate: cred.expiryDate,
      status: cred.isRevoked ? "revoked" : "active",
      verificationUrl: `https://skillchain.io/verify/${cred.tokenId}`,
      blockchainTx: cred.transactionHash,
    }));

    return c.json({
      success: true,
      candidateId,
      walletAddress,
      totalCredentials: formattedCredentials.length,
      credentials: formattedCredentials,
    });
  } catch (error) {
    console.error("Greenhouse candidate credentials error:", error);
    return c.json({ error: "Failed to fetch credentials" }, 500);
  }
});

/**
 * POST /integrations/greenhouse/verify-batch
 * Batch verify credentials for multiple candidates
 */
app.post("/verify-batch", async (c) => {
  try {
    const body = await c.req.json();
    const { candidates } = body; // Array of { candidateId, walletAddress }

    if (!Array.isArray(candidates)) {
      return c.json({ error: "candidates array required" }, 400);
    }

    const db = getDb();
    const results = [];

    for (const candidate of candidates) {
      const { candidateId, walletAddress } = candidate;

      if (!walletAddress) {
        results.push({
          candidateId,
          success: false,
          error: "No wallet address provided",
        });
        continue;
      }

      try {
        const candidateCredentials = await db
          .select()
          .from(credentials)
          .where(eq(credentials.recipientAddress, walletAddress.toLowerCase()));

        results.push({
          candidateId,
          walletAddress,
          success: true,
          totalCredentials: candidateCredentials.length,
          validCredentials: candidateCredentials.filter((c) => !c.isRevoked).length,
          credentials: candidateCredentials.map((cred) => ({
            tokenId: cred.tokenId,
            name: cred.name,
            institution: cred.institution,
            type: cred.credentialType,
            isValid: !cred.isRevoked,
          })),
        });
      } catch (error) {
        results.push({
          candidateId,
          success: false,
          error: "Failed to fetch credentials",
        });
      }
    }

    return c.json({
      success: true,
      totalCandidates: candidates.length,
      results,
    });
  } catch (error) {
    console.error("Greenhouse batch verify error:", error);
    return c.json({ error: "Batch verification failed" }, 500);
  }
});

/**
 * Greenhouse Custom Field Configuration
 * Add this to your Greenhouse account to capture wallet addresses
 */
export const GREENHOUSE_CUSTOM_FIELDS = {
  application: [
    {
      name: "Wallet Address",
      field_type: "short_text",
      required: false,
      private: false,
      description: "Candidate's blockchain wallet address for credential verification",
    },
    {
      name: "Credentials Verified",
      field_type: "yes_no",
      required: false,
      private: false,
      description: "Have the candidate's blockchain credentials been verified?",
    },
    {
      name: "Total Credentials",
      field_type: "number",
      required: false,
      private: false,
      description: "Number of verified blockchain credentials",
    },
  ],
  candidate: [
    {
      name: "Blockchain Wallet",
      field_type: "short_text",
      required: false,
      private: false,
      description: "Candidate's blockchain wallet address",
    },
  ],
};

/**
 * Helper: Update Greenhouse application with credential data
 * (Requires Greenhouse API key)
 */
export async function updateGreenhouseApplication(
  applicationId: number,
  credentialData: {
    totalCredentials: number;
    credentialsVerified: boolean;
    verificationUrl: string;
  },
  greenhouseApiKey: string
) {
  const response = await fetch(
    `https://harvest.greenhouse.io/v1/applications/${applicationId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(greenhouseApiKey + ":").toString("base64")}`,
      },
      body: JSON.stringify({
        custom_fields: [
          {
            name: "Total Credentials",
            value: credentialData.totalCredentials,
          },
          {
            name: "Credentials Verified",
            value: credentialData.credentialsVerified,
          },
        ],
      }),
    }
  );

  return response.json();
}

/**
 * Helper: Add note to Greenhouse candidate
 */
export async function addGreenhouseNote(
  candidateId: number,
  message: string,
  greenhouseApiKey: string
) {
  const response = await fetch(
    `https://harvest.greenhouse.io/v1/candidates/${candidateId}/activity_feed/notes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(greenhouseApiKey + ":").toString("base64")}`,
      },
      body: JSON.stringify({
        message,
        visibility: "public",
      }),
    }
  );

  return response.json();
}

export default app;
