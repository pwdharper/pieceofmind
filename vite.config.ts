import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { generateCopy, type AiCopyRequest } from "./api/generateCopy";

function aiCopyPlugin(): Plugin {
  return {
    name: "ai-copy-api",
    configureServer(server) {
      server.middlewares.use("/api/ai-copy", (req, res, next) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }
        const chunks: string[] = [];
        req.on("data", (chunk) => chunks.push(String(chunk)));
        req.on("error", next);
        req.on("end", () => {
          void (async () => {
            try {
              const body = JSON.parse(chunks.join("")) as AiCopyRequest;
              const result = await generateCopy(body);
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(result));
            } catch (error) {
              console.error("[ai-copy]", error instanceof Error ? error.message : error);
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "ai_failed" }));
            }
          })();
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (env.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
  return {
    plugins: [react(), aiCopyPlugin()],
  };
});
