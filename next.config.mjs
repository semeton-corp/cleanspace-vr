/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ignore A-Frame warnings
    config.ignoreWarnings = [
      { module: /node_modules\/aframe/ }
    ];
    
    // Don't parse A-Frame on server side to avoid SSR issues
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('aframe');
    }
    
    // Handle canvas and WebGL modules
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
  // Transpile A-Frame modules
  transpilePackages: ['aframe'],
  
  // Ensure proper output for Vercel
  output: 'standalone',
};

export default nextConfig;
