/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.nbcnews.com" },
      { protocol: "https", hostname: "**.msnbc.com" },
      { protocol: "https", hostname: "**.nbcuni.com" },
      { protocol: "https", hostname: "media-cldnry.s-nbcnews.com" },
    ],
  },
};

module.exports = nextConfig;
