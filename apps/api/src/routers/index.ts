import { router } from "../lib/trpc";
import { auditRouter } from "./audit";
import { contentRouter } from "./content";
import { employeeRouter } from "./employee";
import { loginRouter } from "./login";
import { metricsRouter } from "./metrics";
import { tagRouter } from "./tag";
import { userRouter } from "./user";

export const appRouter = router({
  login: loginRouter,
  user: userRouter,
  employee: employeeRouter,
  content: contentRouter,
  metrics: metricsRouter,
  audit: auditRouter,
  tag: tagRouter,
});

export type AppRouter = typeof appRouter;
