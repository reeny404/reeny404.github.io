import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: {
    // CSS가 작고 첫 방문이 대부분인 포트폴리오: render-blocking CSS 요청을 없애 FCP, LCP 단축
    inlineCss: true,
  },
};

export default nextConfig;
