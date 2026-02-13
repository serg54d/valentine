import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export",
    basePath: "/valentine",
    assetPrefix: "/valentine/",
    images: {
        unoptimized: true,
    },
};

export default nextConfig;