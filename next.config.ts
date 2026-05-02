import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: {},
  // @ts-ignore - Some TS types might not be updated for this top-level field yet
  allowedDevOrigins: ['10.243.79.102', 'localhost:3000'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  }
};

export default withPWA(nextConfig);
