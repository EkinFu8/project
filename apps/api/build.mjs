import { build } from "esbuild";

await build({
  entryPoints: ["api/trpc/[trpc].ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outdir: "dist/api/trpc",
  // Prisma Client is generated + needs native binaries — keep external
  // pg uses native bindings — keep external
  external: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  banner: {
    // ESM compat shim for __dirname if any dep needs it
    js: 'import{createRequire}from"module";const require=createRequire(import.meta.url);',
  },
});

console.log("✓ Bundled api/trpc/[trpc].ts → dist/api/trpc/[trpc].js");
