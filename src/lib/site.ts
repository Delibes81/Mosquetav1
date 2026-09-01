const DEFAULT_SITE_URL = 'https://mosquetav1.vercel.app';

function resolveSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  try {
    return new URL(configuredUrl || DEFAULT_SITE_URL);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export const siteConfig = {
  name: 'Mosqueta',
  legalName: 'Mosqueta',
  description: 'Muebles, electrodomésticos y equipamiento para hogares y empresas en México.',
  locale: 'es_MX',
  url: resolveSiteUrl(),
};

export function absoluteUrl(pathname = '/') {
  return new URL(pathname, siteConfig.url).toString();
}

