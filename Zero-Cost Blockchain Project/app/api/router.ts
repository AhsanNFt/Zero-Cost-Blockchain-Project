import { authRouter } from "./auth-router";
import { credentialRouter } from "./credential-router";
import { userRouter } from "./user-router";
import { activityRouter } from "./activity-router";
import { employerRouter } from "./employer-router";
import { skillsRouter } from "./skills-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  credential: credentialRouter,
  user: userRouter,
  activity: activityRouter,
  employer: employerRouter,
  skills: skillsRouter,
});

export type AppRouter = typeof appRouter;
