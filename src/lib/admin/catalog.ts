import 'server-only';

import { cache } from 'react';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/auth';
import type {
  AdminCatalogItem,
  CatalogAvailability,
  CatalogOption,
  CatalogProductStatus,
} from '@/lib/admin/catalog-types';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface RelatedOptionRow {
  id: string;
  name: string;
}

interface VariantRow {
  id: string;
  sku: string;
  slug: string;
  manufacturer_model: string;
  source_model: string;
  color: string | null;
  size: string | null;
  specifications: string;
  price_mxn: number | string | null;
  stock: number | null;
  availability: CatalogAvailability;
  published: boolean;
  updated_at: string;
}

interface ProductRow {
  id: string;
  source_ref: string;
  slug: string;
  name: string;
  brand_id: string;
  category_id: string;
  description: string;
  status: CatalogProductStatus;
  data_status: 'base-inicial' | 'requiere-revision';
  source_row: number | null;
  brand: RelatedOptionRow | RelatedOptionRow[];
  category: RelatedOptionRow | RelatedOptionRow[];
  variants: VariantRow[];
}

function unwrapRelation<T>(value: T | T[]) {
  return Array.isArray(value) ? value[0] : value;
}

function mapProductRows(rows: ProductRow[]): AdminCatalogItem[] {
  return rows.flatMap((product) => {
    const brand = unwrapRelation(product.brand);
    const category = unwrapRelation(product.category);

    return product.variants.map((variant) => ({
      productId: product.id,
      variantId: variant.id,
      sourceRef: product.source_ref,
      productSlug: product.slug,
      name: product.name,
      brandId: product.brand_id,
      brandName: brand?.name ?? 'Sin marca',
      categoryId: product.category_id,
      categoryName: category?.name ?? 'Sin categoría',
      description: product.description,
      status: product.status,
      dataStatus: product.data_status,
      sourceRow: product.source_row,
      sku: variant.sku,
      variantSlug: variant.slug,
      manufacturerModel: variant.manufacturer_model,
      sourceModel: variant.source_model,
      color: variant.color,
      size: variant.size,
      specifications: variant.specifications,
      priceMxn: variant.price_mxn === null ? null : Number(variant.price_mxn),
      stock: variant.stock,
      availability: variant.availability,
      published: variant.published,
      updatedAt: variant.updated_at,
    }));
  });
}

export const getAdminCatalogItems = cache(async () => {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('catalog_products')
    .select(`
      id,
      source_ref,
      slug,
      name,
      brand_id,
      category_id,
      description,
      status,
      data_status,
      source_row,
      brand:catalog_brands(id,name),
      category:catalog_categories(id,name),
      variants:catalog_variants(
        id,
        sku,
        slug,
        manufacturer_model,
        source_model,
        color,
        size,
        specifications,
        price_mxn,
        stock,
        availability,
        published,
        updated_at
      )
    `)
    .order('source_row', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true });

  if (error) throw new Error(`No se pudo cargar el catálogo administrativo: ${error.message}`);
  return mapProductRows((data ?? []) as unknown as ProductRow[]);
});

export async function getAdminCatalogItem(variantId: string) {
  const items = await getAdminCatalogItems();
  const item = items.find((candidate) => candidate.variantId === variantId);
  if (!item) notFound();
  return item;
}

export const getCatalogOptions = cache(async () => {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const [brandsResult, categoriesResult] = await Promise.all([
    supabase.from('catalog_brands').select('id,name').order('name'),
    supabase.from('catalog_categories').select('id,name').order('name'),
  ]);

  if (brandsResult.error) throw new Error(`No se pudieron cargar las marcas: ${brandsResult.error.message}`);
  if (categoriesResult.error) {
    throw new Error(`No se pudieron cargar las categorías: ${categoriesResult.error.message}`);
  }

  return {
    brands: (brandsResult.data ?? []) as CatalogOption[],
    categories: (categoriesResult.data ?? []) as CatalogOption[],
  };
});
