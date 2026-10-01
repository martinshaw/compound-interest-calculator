const isProduction = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    // Project Pages site lives at /compound-interest-calculator/
    assetPrefix: isProduction ? '/compound-interest-calculator' : undefined,
    distDir: 'dist',
};

export default nextConfig;
