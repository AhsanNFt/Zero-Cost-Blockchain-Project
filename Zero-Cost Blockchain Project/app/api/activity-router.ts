import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { activityLog } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const activityRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        userAddress: z.string().optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = input.userAddress
        ? eq(activityLog.userAddress, input.userAddress)
        : undefined;

      return db
        .select()
        .from(activityLog)
        .where(conditions)
        .orderBy(desc(activityLog.createdAt))
        .limit(input.limit);
    }),

  log: publicQuery
    .input(
      z.object({
        userAddress: z.string(),
        action: z.enum(["issue", "receive", "verify", "connect", "revoke"]),
        details: z.any().optional(),
        transactionHash: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(activityLog).values({
        userAddress: input.userAddress,
        action: input.action,
        details: input.details ?? null,
        transactionHash: input.transactionHash ?? null,
      });

      return { success: true, id: Number(result[0].insertId) };
    }),
});
