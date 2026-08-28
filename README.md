# Mosqueta - E-commerce B2C

Sitio en Next.js 16 con catálogo inicial de Mosqueta, fichas dinámicas y una base preparada para Supabase.

## Desarrollo local

```powershell
pnpm install
pnpm dev
```

El sitio queda disponible en [http://localhost:3000](http://localhost:3000).

## Configurar Supabase

1. Crea un proyecto en Supabase.
2. Copia `.env.example` como `.env.local` o `.env`. El importador admite ambos; `.env.local` tiene prioridad si existen los dos.
3. Desde **Project Settings > API Keys** (y el botón **Connect** para la URL), agrega:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`

La clave `secret` es secreta. Solo se usa desde el importador local y nunca debe llevar el prefijo `NEXT_PUBLIC_`, subirse a Git o incluirse en código del navegador. Si el proyecto todavía usa claves heredadas, el importador también acepta `SUPABASE_SERVICE_ROLE_KEY`.

4. Ejecuta el contenido de [supabase/migrations/202608270001_catalog_foundation.sql](supabase/migrations/202608270001_catalog_foundation.sql) en el SQL Editor de Supabase.
5. Verifica la carga sin escribir:

```powershell
pnpm catalog:import:dry
```

6. Importa el catálogo:

```powershell
pnpm catalog:import
```

7. Cambia en el archivo de entorno utilizado (`.env.local` o `.env`):

```dotenv
CATALOG_DATA_SOURCE=supabase
```

8. Reinicia el servidor de desarrollo.

Mientras `CATALOG_DATA_SOURCE=local`, el sitio continúa utilizando el archivo local y no depende de Supabase.

## Datos y reimportaciones

El catálogo normalizado está en `src/data/products.generated.json`. El importador:

- crea o actualiza marcas, categorías, productos, variantes e imágenes de referencia;
- mantiene un SKU interno estable por registro;
- publica 72 registros y conserva un duplicado conocido como borrador;
- no envía `price_mxn`, `stock` ni `availability` en las reimportaciones, para proteger la información capturada posteriormente.

Ejemplo de captura manual desde el SQL Editor:

```sql
update public.catalog_variants
set
  price_mxn = 12999.00,
  stock = 4,
  availability = 'en-stock'
where sku = 'MOSQ-EXCEL-7';
```

## Seguridad

- Todas las tablas expuestas tienen Row Level Security.
- Los visitantes únicamente pueden leer productos activos, variantes publicadas e imágenes relacionadas.
- El navegador usa la clave publicable.
- Las escrituras del importador requieren la clave `secret` (o la heredada `service_role`).
- La vista pública usa `security_invoker = true` para respetar las políticas de las tablas.

## Panel administrativo

El panel vive en [http://localhost:3000/admin/login](http://localhost:3000/admin/login) y utiliza Supabase Auth con sesiones SSR por cookies.

1. Ejecuta `supabase/migrations/202608280001_admin_catalog.sql` después de la migración inicial.
2. En **Supabase > Authentication > Users**, crea el usuario administrativo con correo y contraseña.
3. Asígnale un rol desde la terminal:

```powershell
pnpm admin:grant correo@dominio.com admin "Nombre visible"
```

También existe el rol `editor`:

```powershell
pnpm admin:grant correo@dominio.com editor "Nombre visible"
```

El panel permite buscar, crear y editar productos/variantes, capturar precio y disponibilidad, ajustar existencias con movimiento de inventario, publicar y archivar. El archivado es recuperable y no elimina físicamente registros.

La sesión del navegador usa únicamente la clave publicable. Cada escritura se vuelve a autorizar en el servidor y en las políticas RLS de Postgres; la clave secreta solo se utiliza en scripts locales controlados.

## Validaciones

```powershell
pnpm lint
node_modules\.bin\tsc.CMD --noEmit
pnpm build
```

Documentación oficial:

- https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/reference/javascript/upsert
