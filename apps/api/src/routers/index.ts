import { router } from "../lib/trpc";
import { contentRouter } from "./content";
import { employeeRouter } from "./employee";
import { loginRouter } from "./login";
import { tagRouter } from "./tag";
import { userRouter } from "./user";

export const appRouter = router({
  login: loginRouter,
  user: userRouter,
  employee: employeeRouter,
  content: contentRouter,
  tag: tagRouter,
});

export type AppRouter = typeof appRouter;
