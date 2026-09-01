import type { NextConfig } from "next";

function supabaseImagePattern() {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!configuredUrl) return null;

  try {
    const url = new URL(configuredUrl);
    return {
      protocol: 'https' as const,
      hostname: url.hostname,
      port: '',
      pathname: '/storage/v1/object/public/**',
    };
  } catch {
    return null;
  }
}

const supabasePattern = supabaseImagePattern();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(supabasePattern ? [supabasePattern] : []),
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
};

export default nextConfig;
