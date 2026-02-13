import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export",
    // Если репозиторий НЕ username.github.io, а например valentine,
    // то раскомментируй и поставь имя репо:
    // basePath: "/valentine",
    // assetPrefix: "/valentine/",
    images: {
        unoptimized: true,
    },
};

export default nextConfig;