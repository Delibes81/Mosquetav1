import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');

for (const envFilename of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(path.join(projectRoot, envFilename));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

const email = String(process.argv[2] ?? '').trim().toLowerCase();
const role = String(process.argv[3] ?? 'admin').trim().toLowerCase();
const displayName = String(process.argv.slice(4).join(' ') ?? '').trim() || null;

if (!email || !email.includes('@')) {
  throw new Error('Uso: pnpm admin:grant correo@dominio.com [admin|editor] [Nombre visible]');
}

if (!['admin', 'editor'].includes(role)) {
  throw new Error('El rol debe ser admin o editor.');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !secretKey) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY en el archivo de entorno.');
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let matchedUser = null;
let page = 1;

while (!matchedUser) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
  if (error) throw new Error(`No se pudieron consultar los usuarios: ${error.message}`);

  matchedUser = data.users.find((user) => user.email?.toLowerCase() === email) ?? null;
  if (matchedUser || data.users.length < 100) break;
  page += 1;
}

if (!matchedUser) {
  throw new Error(
    `No existe un usuario Auth con el correo ${email}. Créalo primero en Supabase > Authentication > Users.`,
  );
}

const { error: roleError } = await supabase.from('catalog_admin_users').upsert(
  {
    user_id: matchedUser.id,
    role,
    display_name: displayName,
    active: true,
  },
  { onConflict: 'user_id' },
);

if (roleError) throw new Error(`No se pudo asignar el rol: ${roleError.message}`);

console.log(JSON.stringify({ email, role, active: true }, null, 2));
