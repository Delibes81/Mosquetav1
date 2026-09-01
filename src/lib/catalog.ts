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

export const getCatalogProductBySlug = cache(async (slug: string): Promise<CatalogProduct | undefined> => {
  if (!usesSupabaseCatalog()) return getLocalProductBySlug(slug);

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

  return data ? mapRow(data as CatalogProductRow) : undefined;
});
