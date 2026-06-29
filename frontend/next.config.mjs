/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: [],
  async rewrites() {
    const upstream = process.env.API_UPSTREAM || "http://backend:3000";
    return [
      { source: "/kpis", destination: `${upstream}/kpis` },
      { source: "/trend/:path*", destination: `${upstream}/trend/:path*` },
      { source: "/rankings/:path*", destination: `${upstream}/rankings/:path*` },
    ];
  },
};

export default nextConfig;
