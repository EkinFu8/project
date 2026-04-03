import { build } from "esbuild";

await build({
  entryPoints: ["src/handlers/trpc.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: "api/trpc/[trpc].js",
  // Prisma Client is generated + needs native binaries — keep external
  // pg uses native bindings — keep external
  external: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  banner: {
    js: 'import{createRequire}from"module";const require=createRequire(import.meta.url);',
  },
});

console.log("✓ Bundled src/handlers/trpc.ts → api/trpc/[trpc].js");
