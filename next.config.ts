/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true, // Bypasses explicit image hostname checks to allow rapid deployment uploads
  },
};

export default nextConfig;
