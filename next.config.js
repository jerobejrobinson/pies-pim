/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [{
            protocol: 'https',
            hostname: 'yypwcydaoqsssgbxzoqz.supabase.co',
            port: '',
            pathname: '/storage/v1/object/public/part-images/**'
          }]
    }
};

module.exports = nextConfig;
