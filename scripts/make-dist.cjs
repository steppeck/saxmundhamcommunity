const { cpSync, existsSync, mkdirSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const root = process.cwd();
const outDir = join(root, "out");
const distDir = join(root, "dist");

if (!existsSync(outDir)) {
  throw new Error("Next static export did not create the out directory.");
}

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });
cpSync(outDir, distDir, { recursive: true });
