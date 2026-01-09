/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "ylebrbbexlxrqqbjhxvc.supabase.co"],
    unoptimized: false,
  },
};

export default nextConfig;
