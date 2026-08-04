import type { NextConfig } from "next";

function deploymentOrigin(name: string, fallback?: string): URL | null {
  const value = process.env[name]?.trim() || fallback;
  if (!value) {
    return null;
  }

  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    (url.pathname !== "/" && url.pathname !== "")
  ) {
    throw new Error(`${name} must be an HTTP(S) origin without a path.`);
  }
  return url;
}

if (process.env.VERCEL && !process.env.BACKEND_URL) {
  throw new Error("BACKEND_URL must be configured in Vercel.");
}

const backendUrl = deploymentOrigin(
  "BACKEND_URL",
  "http://127.0.0.1:8000",
);
if (!backendUrl) {
  throw new Error("BACKEND_URL is required.");
}

const mediaUrl = deploymentOrigin("MEDIA_HOST");
const remotePatterns: NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> = [
  {
    protocol: backendUrl.protocol.slice(0, -1) as "http" | "https",
    hostname: backendUrl.hostname,
    port: backendUrl.port,
    pathname: "/media/**",
  },
  {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "/**",
  },
];

if (mediaUrl) {
  remotePatterns.push({
    protocol: mediaUrl.protocol.slice(0, -1) as "http" | "https",
    hostname: mediaUrl.hostname,
    port: mediaUrl.port,
    pathname: "/**",
  });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns,
    qualities: [70, 75, 80],
  },
  async rewrites() {
    const origin = backendUrl.origin;

    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: "/media/:path*",
          destination: `${origin}/media/:path*`,
        },
      ],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, max-age=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
