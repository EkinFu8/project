import { build } from "esbuild";

await build({
  entryPoints: ["src/server.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: "dist/server.mjs",
  banner: {
    js: 'import{createRequire}from"module";const require=createRequire(import.meta.url);',
  },
});

console.log("✓ Built → dist/server.mjs");
