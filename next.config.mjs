/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    domains: [
      'example.com',       // ✅ Allow example.com
      'res.cloudinary.com', // (optional) allow Cloudinary if you use it later
      'lh3.googleusercontent.com' // (optional for Google images)
    ],
  },

};

export default nextConfig;
