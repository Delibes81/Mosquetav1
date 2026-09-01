"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { assertAdmin } from '@/lib/admin/auth';
import type { CatalogAvailability } from '@/lib/admin/catalog-types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { CatalogFormState } from '@/app/admin/productos/form-state';

const catalogImageBucket = 'catalog-products';
const maxImagesPerUpload = 10;

export interface CatalogImageActionResult {
  status: 'success' | 'error';
  message: string;
}

interface RegisterCatalogImagesInput {
  productId: string;
  variantId: string;
  storagePaths: string[];
}

interface ReorderCatalogImagesInput {
  productId: string;
  variantId: string;
  imageIds: string[];
}

const allowedAvailability = new Set<CatalogAvailability>([
  'por-confirmar',
  'en-stock',
  'sobre-pedido',
  'agotado',
]);

const uuidSource = '[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';
const uuidPattern = new RegExp(`^${uuidSource}$`, 'i');

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

async function getVerifiedCatalogTarget(productId: string, variantId: string) {
  if (!uuidPattern.test(productId) || !uuidPattern.test(variantId)) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('catalog_variants')
    .select('id,slug,product:catalog_products!inner(id,name)')
    .eq('id', variantId)
    .eq('product_id', productId)
    .maybeSingle();

  if (error || !data) return null;
  const product = Array.isArray(data.product) ? data.product[0] : data.product;
  if (!product) return null;

  return { supabase, slug: data.slug, productName: product.name };
}

function revalidateCatalogImages(variantId: string, slug: string) {
  revalidatePath(`/admin/productos/${variantId}`);
  revalidateCatalog(slug);
}

export async function registerCatalogImagesAction(
  input: RegisterCatalogImagesInput,
): Promise<CatalogImageActionResult> {
  await assertAdmin();
  if (
    !input
    || typeof input.productId !== 'string'
    || typeof input.variantId !== 'string'
    || !Array.isArray(input.storagePaths)
    || input.storagePaths.some((path) => typeof path !== 'string')
  ) {
    return { status: 'error', message: 'Los datos de la carga no son válidos.' };
  }

  const uniquePaths = [...new Set(input.storagePaths)];
  const target = await getVerifiedCatalogTarget(input.productId, input.variantId);

  if (!target) return { status: 'error', message: 'El producto o la variante no son válidos.' };
  if (uniquePaths.length === 0 || uniquePaths.length > maxImagesPerUpload) {
    return { status: 'error', message: 'Selecciona entre 1 y 10 imágenes por carga.' };
  }

  const expectedPathPattern = new RegExp(
    `^${catalogImageBucket}/${input.productId}/${input.variantId}/${uuidSource}\\.webp$`,
    'i',
  );
  if (uniquePaths.some((path) => !expectedPathPattern.test(path))) {
    return { status: 'error', message: 'Una de las rutas de imagen no es válida.' };
  }

  for (const storagePath of uniquePaths) {
    const objectPath = storagePath.slice(catalogImageBucket.length + 1);
    const separator = objectPath.lastIndexOf('/');
    const folder = objectPath.slice(0, separator);
    const fileName = objectPath.slice(separator + 1);
    const { data, error } = await target.supabase.storage
      .from(catalogImageBucket)
      .list(folder, { limit: 10, search: fileName });

    if (error || !data?.some((object) => object.name === fileName)) {
      return { status: 'error', message: 'No se pudo verificar una imagen recién subida.' };
    }
  }

  const { data: currentImages, error: currentImagesError } = await target.supabase
    .from('catalog_product_images')
    .select('id,is_primary,sort_order')
    .eq('product_id', input.productId)
    .or(`variant_id.eq.${input.variantId},variant_id.is.null`)
    .order('sort_order', { ascending: false });

  if (currentImagesError) {
    return { status: 'error', message: `No se pudo preparar la galería: ${currentImagesError.message}` };
  }

  const nextSortOrder = (currentImages?.[0]?.sort_order ?? -1) + 1;
  const hasPrimary = currentImages?.some((image) => image.is_primary) ?? false;
  const rows = uniquePaths.map((storagePath, index) => ({
    product_id: input.productId,
    variant_id: input.variantId,
    storage_path: storagePath,
    alt_text: `${target.productName} - imagen ${nextSortOrder + index + 1}`,
    image_status: 'final',
    is_primary: !hasPrimary && index === 0,
    sort_order: nextSortOrder + index,
  }));
  const { error: insertError } = await target.supabase.from('catalog_product_images').insert(rows);

  if (insertError) {
    return { status: 'error', message: `No se pudieron registrar las imágenes: ${insertError.message}` };
  }

  revalidateCatalogImages(input.variantId, target.slug);
  return {
    status: 'success',
    message: `${uniquePaths.length} ${uniquePaths.length === 1 ? 'imagen agregada' : 'imágenes agregadas'} en WebP.`,
  };
}

export async function reorderCatalogImagesAction(
  input: ReorderCatalogImagesInput,
): Promise<CatalogImageActionResult> {
  await assertAdmin();
  if (
    !input
    || typeof input.productId !== 'string'
    || typeof input.variantId !== 'string'
    || !Array.isArray(input.imageIds)
    || input.imageIds.some((id) => typeof id !== 'string')
  ) {
    return { status: 'error', message: 'Los datos del orden no son válidos.' };
  }

  const target = await getVerifiedCatalogTarget(input.productId, input.variantId);

  if (!target) return { status: 'error', message: 'El producto o la variante no son válidos.' };
  if (input.imageIds.length === 0 || input.imageIds.some((id) => !uuidPattern.test(id))) {
    return { status: 'error', message: 'El orden de imágenes no es válido.' };
  }

  const { error } = await target.supabase.rpc('set_catalog_image_order', {
    p_product_id: input.productId,
    p_variant_id: input.variantId,
    p_image_ids: input.imageIds,
  });

  if (error) return { status: 'error', message: `No se pudo guardar el orden: ${error.message}` };

  revalidateCatalogImages(input.variantId, target.slug);
  return { status: 'success', message: 'Orden guardado. La primera imagen ahora es la principal.' };
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
