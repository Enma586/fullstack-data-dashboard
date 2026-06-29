/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: [],
  async rewrites() {
    return [
      {
        source: "/:path((?:kpis|trend|rankings)/.*)",
        destination: `${process.env.API_UPSTREAM || "http://backend:3000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
