/** @type {import('next').NextConfig} */
const nextConfig = {
  // generateBuildId: async () => process.env.GIT_HASH,
  logging: { fetches: { fullUrl: true } },
  // output: 'standalone',
};

module.exports = nextConfig;
