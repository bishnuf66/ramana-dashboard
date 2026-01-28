/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // remotePatterns is preferred over domains in Next 15+
    remotePatterns: [
  
      {
        protocol: "https",
        hostname: "ylebrbbexlxrqqbjhxvc.supabase.co",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
