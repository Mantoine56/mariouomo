/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: ''
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: ''
      }
    ],
    // Make sure local images from the public directory work correctly
    unoptimized: process.env.NODE_ENV === 'development',
    // Allow SVG images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  // Enable additional transpilation if needed
  transpilePackages: []
};

module.exports = nextConfig; 