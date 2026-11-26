import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel's image optimization quota is exhausted (402); uploads are already resized in the browser.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "puiqiwdtxlldxeuxoaei.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
