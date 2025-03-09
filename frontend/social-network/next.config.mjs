/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // The domains property is deprecated
    // domains: ['i.imgur.com', 'i.redd.it', 'avatars.githubusercontent.com'], // old version
    
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/public/**'
      },
      // Add these to replace the domains entry
      {
        protocol: 'https',
        hostname: 'i.imgur.com'
      },
      {
        protocol: 'https',
        hostname: 'i.redd.it'
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com'
      }
    ]
  },
};

export default nextConfig;