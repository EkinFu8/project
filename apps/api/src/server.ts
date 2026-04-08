import "./load-env";
import type http from "node:http";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { createContext } from "./context";
import { prisma } from "./lib/prisma";
import { appRouter } from "./routers";

const isProduction = process.env.NODE_ENV === "production";

const explicitCorsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : null;

/** Used in production when CORS_ORIGINS is unset (local prod smoke tests). */
const localhostAppOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

function setCorsHeaders(req: http.IncomingMessage, res: http.ServerResponse) {
  const origin = req.headers.origin;
  if (origin) {
    if (explicitCorsOrigins) {
      if (explicitCorsOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      }
    } else if (!isProduction) {
      // Dev: Vite `host: true` → Origin is often 127.0.0.1 or a LAN IP; a fixed allowlist breaks tRPC silently.
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    } else if (localhostAppOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
}

const server = createHTTPServer({
  router: appRouter,
  createContext,
  middleware: (req, res, next) => {
    setCorsHeaders(req, res);

    // Handle preflight OPTIONS
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    next();
  },
});

const port = Number(process.env.PORT) || 3000;

try {
  await prisma.$connect();
} catch (err) {
  console.error(
    "[api] Cannot connect to Postgres (DATABASE_URL). Start local DB with `pnpm db:start`, apply schema with `pnpm db:reset`, and check .env / .env.local at the monorepo root.",
    err,
  );
  process.exit(1);
}

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `[api] Port ${port} is already in use (EADDRINUSE). Stop the other process or set PORT.\n` +
        `  Inspect: lsof -nP -iTCP:${port} -sTCP:LISTEN\n` +
        `  Stop:   kill $(lsof -ti :${port})`,
    );
  } else {
    console.error("[api] HTTP server error:", err);
  }
  process.exit(1);
});

server.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
