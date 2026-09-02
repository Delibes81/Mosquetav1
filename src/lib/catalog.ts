import { cache } from 'react';
import {
  catalogProducts as localCatalogProducts,
  getProductBySlug as getLocalProductBySlug,
  type CatalogProduct,
  type ProductAvailability,
  type ProductDataStatus,
} from '@/data/products';
import { resolveCatalogImage } from '@/lib/catalog-image';
import { getPublicSupabaseClient } from '@/lib/supabase/public-client';

interface CatalogProductRow {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  source_model: string;
  category: string;
  color: string | null;
  size: string | null;
  specifications: string;
  price_mxn: number | string | null;
  stock: number | null;
  availability: ProductAvailability;
  image: string | null;
  image_status: 'referencia' | 'final';
  source_row: number;
  published: boolean;
  data_status: ProductDataStatus;
  sort_order: number;
}

interface CatalogProductImageRow {
  id: string;
  storage_path: string;
  alt_text: string;
  image_status: 'referencia' | 'final';
  is_primary: boolean;
  sort_order: number;
}

export interface CatalogProductImage {
  id: string;
  url: string;
  altText: string;
  imageStatus: 'referencia' | 'final';
  isPrimary: boolean;
  sortOrder: number;
}

export interface CatalogProductDetail extends CatalogProduct {
  gallery: CatalogProductImage[];
}

function usesSupabaseCatalog() {
  return process.env.CATALOG_DATA_SOURCE === 'supabase';
}

function mapRow(row: CatalogProductRow): CatalogProduct {
  const localProduct = getLocalProductBySlug(row.slug);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    model: row.model,
    sourceModel: row.source_model,
    category: row.category,
    color: row.color,
    size: row.size,
    specifications: row.specifications,
    price: row.price_mxn === null ? null : Number(row.price_mxn),
    stock: row.stock,
    availability: row.availability,
    image: resolveCatalogImage(row.image ?? localProduct?.image),
    imageStatus: row.image_status,
    sourceRow: row.source_row,
    published: row.published,
    dataStatus: row.data_status,
  };
}

export const getCatalogProducts = cache(async (): Promise<CatalogProduct[]> => {
  if (!usesSupabaseCatalog()) return localCatalogProducts;

  const supabase = getPublicSupabaseClient();
  if (!supabase) {
    console.error('[catalog] Supabase no está configurado para el catálogo público.');
    return [];
  }

  const { data, error } = await supabase
    .from('catalog_products_public')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error(`[catalog] No se pudo consultar Supabase (${error.code}).`);
    return [];
  }

  return (data as CatalogProductRow[]).map(mapRow);
});

export const getCatalogProductBySlug = cache(async (slug: string): Promise<CatalogProductDetail | undefined> => {
  if (!usesSupabaseCatalog()) {
    const localProduct = getLocalProductBySlug(slug);
    if (!localProduct) return undefined;

    return {
      ...localProduct,
      gallery: [{
        id: `${localProduct.id}-reference`,
        url: localProduct.image,
        altText: `${localProduct.name} ${localProduct.brand} ${localProduct.model}`,
        imageStatus: localProduct.imageStatus,
        isPrimary: true,
        sortOrder: 0,
      }],
    } satisfies CatalogProductDetail;
  }

  const supabase = getPublicSupabaseClient();
  if (!supabase) {
    console.error('[catalog] Supabase no está configurado para la ficha pública.');
    return undefined;
  }

  const { data, error } = await supabase
    .from('catalog_products_public')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error(`[catalog] No se pudo consultar Supabase (${error.code}).`);
    return undefined;
  }

  if (!data) return undefined;

  const product = mapRow(data as CatalogProductRow);
  const { data: variant, error: variantError } = await supabase
    .from('catalog_variants')
    .select('product_id')
    .eq('id', product.id)
    .maybeSingle();

  if (variantError || !variant?.product_id) {
    console.error(`[catalog] No se pudo resolver la galería (${variantError?.code ?? 'sin-producto'}).`);
    return {
      ...product,
      gallery: [{
        id: `${product.id}-fallback`,
        url: product.image,
        altText: `${product.name} ${product.brand} ${product.model}`,
        imageStatus: product.imageStatus,
        isPrimary: true,
        sortOrder: 0,
      }],
    } satisfies CatalogProductDetail;
  }

  const { data: images, error: imagesError } = await supabase
    .from('catalog_product_images')
    .select('id,storage_path,alt_text,image_status,is_primary,sort_order')
    .eq('product_id', variant.product_id)
    .or(`variant_id.eq.${product.id},variant_id.is.null`)
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (imagesError) {
    console.error(`[catalog] No se pudieron consultar las imágenes (${imagesError.code}).`);
  }

  const gallery = ((images ?? []) as CatalogProductImageRow[]).map((image, index) => ({
    id: image.id,
    url: resolveCatalogImage(image.storage_path),
    altText: image.alt_text.trim() || `${product.name} ${product.brand} ${product.model} - imagen ${index + 1}`,
    imageStatus: image.image_status,
    isPrimary: image.is_primary,
    sortOrder: image.sort_order,
  }));

  return {
    ...product,
    gallery: gallery.length > 0 ? gallery : [{
      id: `${product.id}-fallback`,
      url: product.image,
      altText: `${product.name} ${product.brand} ${product.model}`,
      imageStatus: product.imageStatus,
      isPrimary: true,
      sortOrder: 0,
    }],
  } satisfies CatalogProductDetail;
});
