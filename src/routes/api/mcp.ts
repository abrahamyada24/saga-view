import { createFileRoute } from "@tanstack/react-router";
import { createMcpServer, defineTool } from "mcp-tanstack-start";
import { z } from "zod";

const greetTool = defineTool({
  name: "greet",
  description: "Menyapa user dengan nama.",
  parameters: z.object({
    name: z.string().describe("Nama user yang ingin disapa."),
  }),
  execute: async ({ name }) => {
    return `Halo ${name}, MCP Lovable lokal sudah tersambung.`;
  },
});

const mcp = createMcpServer({
  name: "lovable-proto-play-flow",
  version: "0.1.0",
  instructions:
    "MCP server lokal untuk prototype self-photo studio. Gunakan tool yang tersedia untuk mengecek koneksi Codex ke project ini.",
  tools: [greetTool],
  transport: {
    allowedOrigins: ["http://127.0.0.1:5174", "http://localhost:5174"],
  },
});

export const Route = createFileRoute("/api/mcp")({
  server: {
    handlers: {
      ANY: async ({ request }) => mcp.handleRequest(request),
    } as Record<string, (ctx: { request: Request }) => Promise<Response>>,
  },
});
