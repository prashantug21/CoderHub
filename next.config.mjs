/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [new URL('https://img.clerk.com/**')],
    },
};

export default nextConfig;
