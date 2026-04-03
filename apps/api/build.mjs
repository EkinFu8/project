import { mkdirSync, writeFileSync } from "node:fs";
import { build } from "esbuild";

const FUNC_DIR = ".vercel/output/functions/api/trpc/[trpc].func";

// 1. Bundle the handler
await build({
  entryPoints: ["src/handlers/trpc.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: `${FUNC_DIR}/index.mjs`,
  external: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  banner: {
    js: 'import{createRequire}from"module";const require=createRequire(import.meta.url);',
  },
});

// 2. Function config
writeFileSync(
  `${FUNC_DIR}/.vc-config.json`,
  JSON.stringify({
    runtime: "nodejs22.x",
    handler: "index.mjs",
    launcherType: "Nodejs",
  }),
);

// 3. Build Output API config (routes + CORS headers)
mkdirSync(".vercel/output/static", { recursive: true });
writeFileSync(
  ".vercel/output/config.json",
  JSON.stringify(
    {
      version: 3,
      routes: [
        // CORS preflight
        {
          src: "/api/trpc/(.*)",
          methods: ["OPTIONS"],
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
          },
          status: 204,
        },
        // Rewrite all tRPC requests to the function
        {
          src: "/api/trpc/(.*)",
          dest: "/api/trpc/[trpc]",
        },
      ],
    },
    null,
    2,
  ),
);

console.log("✓ Built → .vercel/output/ (Build Output API v3)");
