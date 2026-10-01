const isProduction = process.env.NODE_ENV === 'production'
const basePath = isProduction ? '/compound-interest-calculator' : ''

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    // Project Pages site lives at /compound-interest-calculator/
    basePath,
    assetPrefix: basePath || undefined,
    distDir: 'dist',
};

export default nextConfig;
