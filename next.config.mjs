/** @type {import('next').NextConfig} */

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");
const STORAGE_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

let storagePattern = null;
try {
  const url = new URL(STORAGE_ORIGIN);
  storagePattern = {
    protocol: url.protocol.replace(":", ""),
    hostname: url.hostname,
    ...(url.port ? { port: url.port } : {}),
  };
} catch {}

const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      ...(storagePattern ? [storagePattern] : []),
    ],
  },
};

export default nextConfig;
