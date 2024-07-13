/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    assetPrefix: isProd ? '/compound-interest-calculator' : undefined,
    distDir: 'dist',
};

export default nextConfig;
