import type { MetadataRoute } from 'next';
import { getCatalogProducts } from '@/lib/catalog';
import { absoluteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getCatalogProducts();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/catalogo'), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/corporativo'), changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/sobre-nosotros'), changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/contacto'), changeFrequency: 'monthly', priority: 0.6 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products
    .filter((product) => product.dataStatus !== 'requiere-revision')
    .map((product) => ({
      url: absoluteUrl(`/producto/${product.slug}`),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  return [...staticRoutes, ...productRoutes];
}

