import { absoluteUrl } from '@/lib/site';

export const PRODUCT_IMAGE_BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDQwIDMwIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iMzAiIGZpbGw9IiNlOWVjZjIiLz48L3N2Zz4=';

function publicStorageUrl(storagePath: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  if (!supabaseUrl) return null;

  const normalizedPath = storagePath.replace(/^\/+/, '');
  return `${supabaseUrl}/storage/v1/object/public/${normalizedPath}`;
}

export function resolveCatalogImage(image: string | null | undefined) {
  const value = image?.trim();
  if (!value) return '/products/catalog-01.jpg';
  if (value.startsWith('/')) return value;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : '/products/catalog-01.jpg';
  } catch {
    return publicStorageUrl(value) ?? '/products/catalog-01.jpg';
  }
}

export function absoluteCatalogImage(image: string) {
  return image.startsWith('/') ? absoluteUrl(image) : image;
}

