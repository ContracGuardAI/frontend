import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // pdf-parse mencoba load test files yang tidak ada di Next.js
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        encoding: false,
      };
    }
    // Izinkan import dari contractguard-agent/ yang ada di luar frontend/
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(__dirname, ".."),
    ];
    return config;
  },
};
export default nextConfig;
