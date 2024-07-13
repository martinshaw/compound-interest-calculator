const isProduction = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    assetPrefix: isProduction ? '/compound-interest-calculator' : undefined,
    distDir: 'dist',
};

export default nextConfig;
