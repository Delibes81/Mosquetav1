import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const catalogPath = path.join(projectRoot, 'src', 'data', 'products.generated.json');
const dryRun = process.argv.includes('--dry-run');

for (const envFilename of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(path.join(projectRoot, envFilename));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

const products = JSON.parse(await fs.readFile(catalogPath, 'utf8'));

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function skuFor(product) {
  return `MOSQ-${product.id.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`;
}

function fail(operation, error) {
  const details = [error.code, error.hint, error.message].filter(Boolean).join(' | ');
  throw new Error(`${operation}: ${details}`);
}

const summary = {
  records: products.length,
  published: products.filter((product) => product.published).length,
  drafts: products.filter((product) => !product.published).length,
  brands: new Set(products.map((product) => product.brand)).size,
  categories: new Set(products.map((product) => product.category)).size,
};

if (dryRun) {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !secretKey) {
  throw new Error(
    'Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY (o la clave heredada SUPABASE_SERVICE_ROLE_KEY) en .env.local o .env',
  );
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const brandRows = [...new Set(products.map((product) => product.brand))]
  .map((name) => ({ name, slug: slugify(name) }));
const categoryRows = [...new Set(products.map((product) => product.category))]
  .map((name, index) => ({ name, slug: slugify(name), sort_order: index }));

const { data: importedBrands, error: brandError } = await supabase
  .from('catalog_brands')
  .upsert(brandRows, { onConflict: 'slug' })
  .select('id,slug');
if (brandError) fail('No se pudieron importar las marcas', brandError);

const { data: importedCategories, error: categoryError } = await supabase
  .from('catalog_categories')
  .upsert(categoryRows, { onConflict: 'slug' })
  .select('id,slug');
if (categoryError) fail('No se pudieron importar las categorías', categoryError);

const brandIds = new Map(importedBrands.map((brand) => [brand.slug, brand.id]));
const categoryIds = new Map(importedCategories.map((category) => [category.slug, category.id]));

const productRows = products.map((product) => ({
  source_ref: product.id,
  slug: product.slug,
  name: product.name,
  brand_id: brandIds.get(slugify(product.brand)),
  category_id: categoryIds.get(slugify(product.category)),
  description: product.specifications,
  status: product.published ? 'active' : 'draft',
  data_status: product.dataStatus,
  source_row: product.sourceRow,
  metadata: {
    source: 'Catalogo Mosqueta Productos.xlsx',
    image_source: 'Catálogo Mosqueta 2.pdf',
  },
}));

const { data: importedProducts, error: productError } = await supabase
  .from('catalog_products')
  .upsert(productRows, { onConflict: 'source_ref' })
  .select('id,source_ref');
if (productError) fail('No se pudieron importar los productos', productError);

const productIds = new Map(importedProducts.map((product) => [product.source_ref, product.id]));
const variantRows = products.map((product, index) => ({
  product_id: productIds.get(product.id),
  sku: skuFor(product),
  slug: product.slug,
  manufacturer_model: product.model,
  source_model: product.sourceModel,
  color: product.color,
  size: product.size,
  specifications: product.specifications,
  published: product.published,
  sort_order: index,
}));

// price_mxn, stock y availability se omiten intencionalmente para no borrar
// valores capturados por el equipo cuando el importador se ejecute de nuevo.
const { data: importedVariants, error: variantError } = await supabase
  .from('catalog_variants')
  .upsert(variantRows, { onConflict: 'sku' })
  .select('id,sku,product_id');
if (variantError) fail('No se pudieron importar las variantes', variantError);

const variantsBySku = new Map(importedVariants.map((variant) => [variant.sku, variant]));
const imageRows = products.map((product) => {
  const variant = variantsBySku.get(skuFor(product));
  return {
    product_id: variant.product_id,
    variant_id: variant.id,
    storage_path: product.image,
    alt_text: `${product.name} ${product.brand}`,
    image_status: product.imageStatus,
    is_primary: false,
    sort_order: 100,
  };
});

const { error: imageError } = await supabase
  .from('catalog_product_images')
  .upsert(imageRows, { onConflict: 'product_id,variant_id,storage_path' });
if (imageError) fail('No se pudieron importar las imágenes de referencia', imageError);

const { count, error: verificationError } = await supabase
  .from('catalog_products_public')
  .select('id', { count: 'exact', head: true });
if (verificationError) fail('No se pudo verificar el catálogo público', verificationError);

console.log(JSON.stringify({ ...summary, publicRecords: count }, null, 2));
