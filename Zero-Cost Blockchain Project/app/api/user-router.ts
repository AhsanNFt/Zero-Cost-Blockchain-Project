import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { walletUsers } from "@db/schema";
import { eq } from "drizzle-orm";

export const userRouter = createRouter({
  getOrCreate: publicQuery
    .input(
      z.object({
        walletAddress: z.string(),
        displayName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(walletUsers)
        .where(eq(walletUsers.walletAddress, input.walletAddress))
        .limit(1);

      if (existing[0]) {
        return existing[0];
      }

      const result = await db.insert(walletUsers).values({
        walletAddress: input.walletAddress,
        displayName: input.displayName ?? null,
      });

      const created = await db
        .select()
        .from(walletUsers)
        .where(eq(walletUsers.id, Number(result[0].insertId)))
        .limit(1);

      return created[0];
    }),

  getByWallet: publicQuery
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(walletUsers)
        .where(eq(walletUsers.walletAddress, input.walletAddress))
        .limit(1);

      return result[0] ?? null;
    }),

  updateProfile: publicQuery
    .input(
      z.object({
        walletAddress: z.string(),
        displayName: z.string().optional(),
        institutionName: z.string().optional(),
        profileImage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(walletUsers)
        .set({
          displayName: input.displayName ?? undefined,
          institutionName: input.institutionName ?? undefined,
          profileImage: input.profileImage ?? undefined,
          updatedAt: new Date(),
        })
        .where(eq(walletUsers.walletAddress, input.walletAddress));

      const updated = await db
        .select()
        .from(walletUsers)
        .where(eq(walletUsers.walletAddress, input.walletAddress))
        .limit(1);

      return updated[0];
    }),
});
