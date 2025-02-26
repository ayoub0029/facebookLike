/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.imgur.com', 'i.redd.it', 'avatars.githubusercontent.com'],
    remotePatterns: [{
      protocol: 'http',
      hostname: 'localhost',
      port: '8080',
      pathname: '/public/**'
    }]
  },
};

export default nextConfig;
