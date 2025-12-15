/** @type {import('next').NextConfig} */
/** Next.js image configuration: add remote hostnames used by next/image */
const nextConfig = {
  images: {
    domains: [
      "i.pravatar.cc",
      "www.svgrepo.com",
      "cdn.builder.io",
      "cdn.jsdelivr.net",
      "images.unsplash.com",
      "picsum.photos",
      "apisoapp.twingroups.com",
    ],
  },

  // Ensure Turbopack resolves the workspace root to this project folder.
  // This prevents Next from inferring C:\Users\Ahmed and using the wrong lockfile.
  turbopack: {
    root: "C:\\Users\\Ahmed\\Desktop\\Quran\\quran-app",
  },

  async rewrites() {
    return [
      {
        source: '/api/v1/fatwas/my/:status',
        destination: 'http://192.168.1.29:8080/api/v1/fatwas/my/:status',
      },
    ];
  },
};

module.exports = nextConfig;
