const { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } = require("node:fs");
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
writeFileSync(
  join(serverDir, "index.js"),
  `export default {
  async fetch(request, env) {
    const assets = env && (env.ASSETS || env.__STATIC_CONTENT);
    if (assets && typeof assets.fetch === "function") {
      const response = await assets.fetch(request);
      if (response.status !== 404) return response;

      const url = new URL(request.url);
      if (!url.pathname.includes(".")) {
        return assets.fetch(new Request(new URL("/index.html", url), request));
      }
    }

    return new Response("Saxmundham Rail Watch is deployed, but static assets are unavailable.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};
`,
);
