"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { assertAdmin } from '@/lib/admin/auth';
import type { CatalogAvailability } from '@/lib/admin/catalog-types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { CatalogFormState } from '@/app/admin/productos/form-state';

const allowedAvailability = new Set<CatalogAvailability>([
  'por-confirmar',
  'en-stock',
  'sobre-pedido',
  'agotado',
]);

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readText(formData: FormData, name: string, maxLength = 5000) {
  return String(formData.get(name) ?? '').trim().slice(0, maxLength);
}

function readNullableNumber(formData: FormData, name: string) {
  const value = readText(formData, name, 40);
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : Number.NaN;
}

function mapDatabaseError(error: { code?: string; message: string }) {
  if (error.code === '23505') {
    return 'El SKU, la referencia o el slug ya pertenecen a otro producto.';
  }
  if (error.code === '23503') {
    return 'La marca o categoría seleccionada ya no existe.';
  }
  return error.message;
}

function parseCatalogForm(formData: FormData) {
  const fieldErrors: Record<string, string> = {};
  const name = readText(formData, 'name', 180);
  const manufacturerModel = readText(formData, 'manufacturer_model', 160);
  const sourceModel = readText(formData, 'source_model', 200) || manufacturerModel;
  const sku = readText(formData, 'sku', 120).toUpperCase();
  const sourceRef = readText(formData, 'source_ref', 160) || sku;
  const brandId = readText(formData, 'brand_id', 40);
  const categoryId = readText(formData, 'category_id', 40);
  const productSlug = slugify(readText(formData, 'product_slug', 220) || `${name}-${manufacturerModel}`);
  const variantSlug = slugify(readText(formData, 'variant_slug', 220) || productSlug);
  const priceMxn = readNullableNumber(formData, 'price_mxn');
  const stockValue = readNullableNumber(formData, 'stock');
  const stock = stockValue === null ? null : Number(stockValue);
  const availabilityValue = readText(formData, 'availability', 40) as CatalogAvailability;
  const published = formData.get('published') === 'on';

  if (!name) fieldErrors.name = 'Escribe el nombre del producto.';
  if (!manufacturerModel) fieldErrors.manufacturer_model = 'Escribe el modelo comercial.';
  if (!sku) fieldErrors.sku = 'Escribe un SKU único.';
  if (!sourceRef) fieldErrors.source_ref = 'Escribe una referencia interna.';
  if (!productSlug) fieldErrors.product_slug = 'No fue posible generar un slug.';
  if (!uuidPattern.test(brandId)) fieldErrors.brand_id = 'Selecciona una marca válida.';
  if (!uuidPattern.test(categoryId)) fieldErrors.category_id = 'Selecciona una categoría válida.';
  if (priceMxn !== null && (!Number.isFinite(priceMxn) || priceMxn < 0)) {
    fieldErrors.price_mxn = 'El precio debe ser un número igual o mayor que cero.';
  }
  if (stock !== null && (!Number.isInteger(stock) || stock < 0)) {
    fieldErrors.stock = 'La existencia debe ser un número entero igual o mayor que cero.';
  }
  if (!allowedAvailability.has(availabilityValue)) {
    fieldErrors.availability = 'Selecciona una disponibilidad válida.';
  }

  return {
    fieldErrors,
    values: {
      p_source_ref: sourceRef,
      p_product_slug: productSlug,
      p_name: name,
      p_brand_id: brandId,
      p_category_id: categoryId,
      p_description: readText(formData, 'description'),
      p_sku: sku,
      p_variant_slug: variantSlug,
      p_manufacturer_model: manufacturerModel,
      p_source_model: sourceModel,
      p_color: readText(formData, 'color', 120),
      p_size: readText(formData, 'size', 120),
      p_specifications: readText(formData, 'specifications', 12000),
      p_price_mxn: priceMxn,
      p_stock: stock,
      p_availability: availabilityValue,
      p_published: published,
    },
  };
}

function revalidateCatalog(slug?: string) {
  revalidatePath('/admin/productos');
  revalidatePath('/catalogo');
  revalidatePath('/producto/[slug]', 'page');
  if (slug) revalidatePath(`/producto/${slug}`);
}

export async function saveCatalogItemAction(
  _previousState: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  await assertAdmin();
  const mode = readText(formData, 'mode', 10);
  const productId = readText(formData, 'product_id', 40);
  const variantId = readText(formData, 'variant_id', 40);
  const originalSlug = readText(formData, 'original_slug', 220);
  const { fieldErrors, values } = parseCatalogForm(formData);

  if (mode !== 'create' && mode !== 'update') {
    return { status: 'error', message: 'Operación no válida.', fieldErrors };
  }
  if (mode === 'update' && (!uuidPattern.test(productId) || !uuidPattern.test(variantId))) {
    return { status: 'error', message: 'El producto que intentas editar no es válido.', fieldErrors };
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'Revisa los campos marcados.', fieldErrors };
  }

  const supabase = await createSupabaseServerClient();

  if (mode === 'create') {
    const { data, error } = await supabase.rpc('create_catalog_item', values);
    if (error) {
      return { status: 'error', message: mapDatabaseError(error), fieldErrors: {} };
    }

    const result = Array.isArray(data) ? data[0] : data;
    const createdVariantId = result?.variant_id as string | undefined;
    if (!createdVariantId) {
      return { status: 'error', message: 'Supabase no devolvió la variante creada.', fieldErrors: {} };
    }

    revalidateCatalog(values.p_variant_slug);
    redirect(`/admin/productos/${createdVariantId}?created=1`);
  }

  const { error } = await supabase.rpc('update_catalog_item', {
    p_product_id: productId,
    p_variant_id: variantId,
    ...values,
  });

  if (error) {
    return { status: 'error', message: mapDatabaseError(error), fieldErrors: {} };
  }

  revalidateCatalog(originalSlug || values.p_variant_slug);
  if (values.p_variant_slug !== originalSlug) revalidateCatalog(values.p_variant_slug);

  return {
    status: 'success',
    message: 'Producto actualizado correctamente.',
    fieldErrors: {},
  };
}

export async function setProductArchivedAction(
  productId: string,
  archived: boolean,
  _formData: FormData,
) {
  void _formData;
  await assertAdmin();
  if (!uuidPattern.test(productId)) throw new Error('Producto no válido.');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('set_catalog_product_archived', {
    p_product_id: productId,
    p_archived: archived,
  });

  if (error) throw new Error(mapDatabaseError(error));
  revalidateCatalog();
  redirect('/admin/productos');
}
