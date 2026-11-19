/** Static export retains the existing asset URLs and can be deployed without a Node server. */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;
