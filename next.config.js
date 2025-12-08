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
      "192.168.1.18",
    ],
  },

  // Ensure Turbopack resolves the workspace root to this project folder.
  // This prevents Next from inferring C:\Users\Ahmed and using the wrong lockfile.
  turbopack: {
    root: "C:\\Users\\Ahmed\\Desktop\\Quran\\quran-app",
  },

  // Optional: add other Next config values below if needed.
  // For example, to avoid the images.domains deprecation warning you can
  // migrate to images.remotePatterns here.
  // images: {
  //   remotePatterns: [
  //     // { protocol: 'https', hostname: 'example.com', pathname: '/**' },
  //   ],
  // },
};

module.exports = nextConfig;
