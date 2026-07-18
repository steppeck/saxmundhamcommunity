const { cpSync, existsSync, mkdirSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const root = process.cwd();
const outDir = join(root, "out");
const distDir = join(root, "dist");
const clientDir = join(distDir, "client");
const serverDir = join(distDir, "server");

if (!existsSync(outDir)) {
  throw new Error("Next static export did not create the out directory.");
}

rmSync(distDir, { recursive: true, force: true });
mkdirSync(clientDir, { recursive: true });
mkdirSync(serverDir, { recursive: true });
mkdirSync(join(distDir, ".openai"), { recursive: true });
cpSync(outDir, clientDir, { recursive: true });
cpSync(join(root, ".openai", "hosting.json"), join(distDir, ".openai", "hosting.json"));
cpSync(join(root, "server", "index.js"), join(serverDir, "index.js"));
