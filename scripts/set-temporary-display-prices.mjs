import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const applyChanges = process.argv.includes('--apply');

for (const envFilename of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(path.join(projectRoot, envFilename));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !secretKey) {
  throw new Error('Faltan las credenciales de servidor de Supabase.');
}

const priceBySize = new Map([
  [55, 30000],
  [65, 40000],
  [75, 50000],
]);

const supabase = createClient(supabaseUrl, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase
  .from('catalog_products_public')
  .select('id,slug,name,category,price_mxn')
  .eq('category', 'Pantallas')
  .order('sort_order', { ascending: true });

if (error) throw new Error(`No se pudieron consultar las pantallas: ${error.code} ${error.message}`);

const updates = data.flatMap((product) => {
  const match = product.name.match(/\b(55|65|75)\s*["″]/);
  if (!match) return [];
  const size = Number(match[1]);
  return [{
    id: product.id,
    slug: product.slug,
    name: product.name,
    size,
    previousPrice: product.price_mxn === null ? null : Number(product.price_mxn),
    price: priceBySize.get(size),
  }];
});

console.table(updates.map(({ name, size, previousPrice, price }) => ({ name, size, previousPrice, price })));

if (!applyChanges) {
  console.log(`Simulación: ${updates.length} pantallas listas. Ejecuta con --apply para guardar los precios.`);
} else {
  const results = await Promise.all(updates.map(async (update) => {
    const { error: updateError } = await supabase
      .from('catalog_variants')
      .update({ price_mxn: update.price })
      .eq('id', update.id);

    if (updateError) throw new Error(`No se pudo actualizar ${update.slug}: ${updateError.code} ${updateError.message}`);
    return update;
  }));

  console.log(`Precios temporales aplicados a ${results.length} pantallas.`);
}
