import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "tesseract.js", "@prisma/client", "prisma"],
  async redirects() {
    return [
      { source: "/portal/quote", destination: "/portal/broker/quote", permanent: false },
      { source: "/portal/documents", destination: "/portal/typing/documents", permanent: false },
      { source: "/portal/policies", destination: "/portal/typing/policies", permanent: false },
    ];
  },
};

export default nextConfig;
