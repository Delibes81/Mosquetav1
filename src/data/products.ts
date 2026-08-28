import rawProducts from './products.generated.json';

export type ProductAvailability = 'por-confirmar' | 'en-stock' | 'sobre-pedido' | 'agotado';
export type ProductDataStatus = 'base-inicial' | 'requiere-revision';

export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  sourceModel: string;
  category: string;
  color: string | null;
  size: string | null;
  specifications: string;
  price: number | null;
  stock: number | null;
  availability: ProductAvailability;
  image: string;
  imageStatus: 'referencia' | 'final';
  sourceRow: number;
  published: boolean;
  dataStatus: ProductDataStatus;
}

export const allCatalogRecords = rawProducts as unknown as CatalogProduct[];
export const catalogProducts = allCatalogRecords.filter((product) => product.published);

export const catalogCategories = [...new Set(catalogProducts.map((product) => product.category))]
  .sort((a, b) => a.localeCompare(b, 'es'));

export const catalogBrands = [...new Set(catalogProducts.map((product) => product.brand))]
  .sort((a, b) => a.localeCompare(b, 'es'));

const featuredCategories = ['Centros de lavado', 'Colchones', 'Pantallas', 'Refrigeradores'];
export const featuredProducts = featuredCategories
  .map((category) => catalogProducts.find((product) => product.category === category))
  .filter((product): product is CatalogProduct => Boolean(product));

export function getProductBySlug(slug: string) {
  return catalogProducts.find((product) => product.slug === slug);
}

export function formatProductPrice(price: number | null) {
  if (price === null) return null;

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(price);
}
