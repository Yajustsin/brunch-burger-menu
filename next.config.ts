import type { NextConfig } from "next";

const isStatic = process.env.STATIC_EXPORT === "1";
const basePath = isStatic ? "/brunch-burger-menu" : "";

const nextConfig: NextConfig = {
  ...(isStatic && {
    output: "export",
    basePath,
    images: { unoptimized: true },
  }),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
