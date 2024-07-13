const isProduction = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    assetPrefix: '/compound-interest-calculator',
    distDir: 'dist',
};

export default nextConfig;
