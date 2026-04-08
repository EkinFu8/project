import { router } from "../lib/trpc";
import { contentRouter } from "./content";
import { employeeRouter } from "./employee";
import { healthRouter } from "./health";
import { loginRouter } from "./login";
import { userRouter } from "./user";

export const appRouter = router({
  health: healthRouter,
  user: userRouter,
  employee: employeeRouter,
  content: contentRouter,
  login: loginRouter,
});

export type AppRouter = typeof appRouter;
