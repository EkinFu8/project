import { router } from "../lib/trpc";
import { contentRouter } from "./content";
import { employeeRouter } from "./employee";
import { loginRouter } from "./login";
import { userRouter } from "./user";
import { metricsRouter } from "./metrics";
import { auditRouter } from "./audit";

export const appRouter = router({
  login: loginRouter,
  user: userRouter,
  employee: employeeRouter,
  content: contentRouter,
  metrics: metricsRouter,
  audit: auditRouter,
});

export type AppRouter = typeof appRouter;
