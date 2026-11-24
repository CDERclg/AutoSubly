
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["ffmpeg-static"],

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
