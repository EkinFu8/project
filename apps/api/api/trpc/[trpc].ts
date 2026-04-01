import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createFetchContext } from "../../src/context";
import { appRouter } from "../../src/routers";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createFetchContext,
  });
}
