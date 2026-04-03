import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createFetchContext } from "../context";
import { appRouter } from "../routers";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Use { fetch } object export so Vercel's launcher bridges to Web API Request/Response.
// A bare `export default function` receives Node.js IncomingMessage instead.
export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: request,
      router: appRouter,
      createContext: createFetchContext,
    });

    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value);
    }

    return response;
  },
};
