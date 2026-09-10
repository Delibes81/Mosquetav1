// Run with: node scripts/test-order-permissions.mjs /absolute/path/to/@electric-sql/pglite/dist/index.js
// Uses an in-memory PostgreSQL instance only. Never connects to Supabase.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

if (!process.argv[2]) throw new Error('Indica la ruta del módulo temporal de PGlite.');
const { PGlite } = await import(pathToFileURL(process.argv[2]).href);
const db = new PGlite();
const migration = (name) => readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8');
const orderId = '20000000-0000-4000-8000-000000000001';
const users = {
  admin: '10000000-0000-4000-8000-000000000001',
  editor: '10000000-0000-4000-8000-000000000002',
  inactive: '10000000-0000-4000-8000-000000000003',
  outsider: '10000000-0000-4000-8000-000000000004',
};
let passed = 0;
async function check(name, callback) {
  await callback();
  passed += 1;
  console.log(`OK ${name}`);
}
async function asUser(user) {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [user ?? '']);
  await db.exec('set role authenticated');
}
const update = (status, note = '') => db.query(
  'select public.update_order_fulfillment_status($1, $2, $3)', [orderId, status, note],
);
const permissionDenied = (error) => error.code === '42501';

try {
  // Emulate Supabase identity only; tables, policies and business functions below
  // are loaded from the real project migrations.
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
    grant usage on schema auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
  `);
  // gen_random_uuid is built into PostgreSQL; PGlite does not need pgcrypto.
  await db.exec((await migration('202608270001_catalog_foundation.sql'))
    .replace('create extension if not exists pgcrypto;', ''));
  await db.exec(await migration('202608280001_admin_catalog.sql'));
  await db.exec(await migration('202609010001_orders.sql'));
  for (const user of Object.values(users)) {
    await db.query('insert into auth.users(id) values ($1)', [user]);
  }
  for (const role of ['admin', 'editor', 'inactive']) {
    await db.query('insert into public.catalog_admin_users(user_id, role, active) values ($1, $2, $3)',
      [users[role], role === 'editor' ? 'editor' : 'admin', role !== 'inactive']);
  }
  await db.query(`insert into public.orders (
    id, stripe_checkout_session_id, subtotal_mxn, total_mxn,
    customer_name, customer_email, customer_phone, address_line1,
    neighborhood, city, state, postal_code
  ) values ($1, 'cs_test_qa', 100, 100, 'Cliente QA', 'qa@example.invalid',
    '5555555555', 'Calle QA 1', 'Colonia QA', 'CDMX', 'CDMX', '01000')`, [orderId]);

  await asUser(users.admin);
  await check('Reproduce el fallo original del administrador', async () => {
    await assert.rejects(update('confirmed'), permissionDenied);
  });
  await db.exec('reset role');
  const fix = await migration('202609090001_order_fulfillment_permissions.sql');
  await db.exec(fix);
  await check('La migración puede volver a aplicarse', () => db.exec(fix));
  await asUser(users.admin);
  await check('Administrador actualiza estado con historial y autor', async () => {
    await update('confirmed', '  Entrega coordinada  ');
    const { rows } = await db.query('select * from public.order_status_history where order_id = $1', [orderId]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].previous_status, 'fulfillment:new');
    assert.equal(rows[0].new_status, 'fulfillment:confirmed');
    assert.equal(rows[0].note, 'Entrega coordinada');
    assert.equal(rows[0].created_by, users.admin);
  });
  await check('Repetir el estado no duplica historial', async () => {
    await update('confirmed');
    const { rows } = await db.query('select count(*)::int as count from public.order_status_history');
    assert.equal(rows[0].count, 1);
  });
  await check('El administrador no puede escribir directamente las tablas', async () => {
    await assert.rejects(db.query("update public.orders set payment_status = 'paid' where id = $1", [orderId]), permissionDenied);
    await assert.rejects(db.query("update public.orders set fulfillment_status = 'delivered' where id = $1", [orderId]), permissionDenied);
    await assert.rejects(db.query("insert into public.order_status_history(order_id, event_type, new_status) values ($1, 'payment', 'payment:paid')", [orderId]), permissionDenied);
  });
  await check('Estado inválido no cambia el pedido ni el historial', async () => {
    await assert.rejects(update('inventado'), /Estado operativo no válido/);
    const { rows } = await db.query('select fulfillment_status, payment_status from public.orders where id = $1', [orderId]);
    assert.equal(rows[0].fulfillment_status, 'confirmed');
    assert.equal(rows[0].payment_status, 'pending');
  });
  await asUser(users.editor);
  await check('Editor activo conserva acceso operativo', () => update('preparing', 'Preparación QA'));
  for (const role of ['inactive', 'outsider']) {
    await asUser(users[role]);
    await check(`${role}: no puede leer ni cambiar pedidos`, async () => {
      await assert.rejects(update('delivered'), /No autorizado/);
      assert.equal((await db.query('select * from public.orders')).rows.length, 0);
      assert.equal((await db.query('select * from public.order_status_history')).rows.length, 0);
    });
  }
  await asUser(null);
  await check('Identidad vacía no puede cambiar pedidos', async () => {
    await assert.rejects(update('delivered'), /No autorizado/);
  });
  await db.exec('reset role; set role anon');
  await check('Anónimo no puede ejecutar la función', async () => {
    await assert.rejects(update('delivered'), permissionDenied);
  });
  await db.exec('reset role');
  await check('Resultado final conserva pago y dos cambios operativos', async () => {
    const { rows } = await db.query('select fulfillment_status, payment_status from public.orders where id = $1', [orderId]);
    assert.equal(rows[0].fulfillment_status, 'preparing');
    assert.equal(rows[0].payment_status, 'pending');
    assert.equal((await db.query('select count(*)::int as count from public.order_status_history')).rows[0].count, 2);
  });
  console.log(`${passed} comprobaciones aprobadas.`);
} finally {
  await db.close();
}
