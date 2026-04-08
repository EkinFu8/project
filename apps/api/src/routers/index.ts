import { router } from "../lib/trpc";
import { contentRouter } from "./content";
import { employeeRouter } from "./employee";
import { loginRouter } from "./login";
import { userRouter } from "./user";

export const appRouter = router({
  login: loginRouter,
  user: userRouter,
  employee: employeeRouter,
  content: contentRouter,
});

export type AppRouter = typeof appRouter;
