/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // remotePatterns is preferred over domains in Next 15+
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ylebrbbexlxrqqbjhxvc.supabase.co",
        pathname: "/storage/**",
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
