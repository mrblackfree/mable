import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 강제 빌드 ID (캐시 무효화)
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  
  // 실험적 기능
  experimental: {
    // Turbopack 사용
  },
  
  // 이미지 최적화
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
