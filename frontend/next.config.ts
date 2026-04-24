import type { NextConfig } from "next";

// Where our FastAPI backend lives. Used ONLY at build time by Next's rewrite
// engine to set up the edge proxy — never shipped to the client bundle.
// Override in Vercel with the BACKEND_URL environment variable.
const BACKEND_URL =
  process.env.BACKEND_URL || "https://web-production-66fe3.up.railway.app";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
      { source: "/docs", destination: `${BACKEND_URL}/docs` },
      { source: "/openapi.json", destination: `${BACKEND_URL}/openapi.json` },
    ];
  },
};

export default nextConfig;
