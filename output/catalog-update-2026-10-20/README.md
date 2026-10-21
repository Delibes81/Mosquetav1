# Fotografías adicionales de Mosqueta

Actualización posterior: las 13 fotografías inicialmente retenidas ya se resolvieron con aprobación del usuario. Doce se aplicaron en `../catalog-update-2026-10-20-corrections/` y la fotografía de 65 pulgadas en `../catalog-update-2026-10-20-tv-65/`, con destino 65QD6QV elegido por el usuario. Las 31 imágenes nuevas recibidas están subidas y asignadas. Las secciones siguientes conservan los resultados del primer bloque de 18 fotografías para auditoría.

Preparación y aplicación del 20 de octubre de 2026. Se subieron y vincularon 18 fotografías a 17 galerías en Supabase; no se modificaron variantes, precios, existencias, URLs, publicación ni políticas del sitio.

## Aplicación remota verificada

La consulta de inspección confirmó 17 coincidencias únicas por marca, modelo normalizado, referencia de origen y URL. Después de subir los 18 WebP al bucket existente `catalog-products`, la transacción `apply-live-images.sql` confirmó 18 imágenes vinculadas, 17 galerías, 17 imágenes anteriores conservadas, cero variantes alteradas y cero cambios en los campos protegidos de productos. Antes de modificar las galerías se guardó una copia recuperable en `catalog_products.metadata.client_images_20261020_before`.

Las 18 URLs públicas respondieron con `image/webp` y SHA-256 idéntico al archivo preparado. Las 17 fichas públicas respondieron HTTP 200 e incluyeron las imágenes nuevas. La galería de `MS-1536GIR` se comprobó visualmente: muestra las dos imágenes nuevas primero y conserva la imagen de referencia anterior al final. Resultado en `application-result.json` y evidencia en `galeria-publicada.jpg`. Las 13 fotografías retenidas no se subieron.

## Resultado

- La entrega contiene 62 imágenes. Las 31 anteriores se conservaron sin reprocesarlas.
- Convertidas las 31 nuevas: 3,732,397 bytes originales → 341,704 bytes WebP, una reducción del 90.8%.
- Calidad 82, lado máximo de 2000 px, orientación EXIF respetada y sin ampliar imágenes pequeñas.
- Las fotografías opacas mantienen su fondo original. No se retocaron productos, textos, marcas ni características.
- Los 62 originales recibidos conservaron sus huellas SHA-256.
- Verificados formato, dimensiones y huella de los 31 WebP; el ZIP contiene exactamente esos 31 archivos y pasó la comprobación de integridad.

## Archivos

- `webp/listas/`: 18 fotografías para 17 modelos cuya coincidencia única se confirmó contra la base remota; ya subidas y asignadas.
- `upload-listas/`: las mismas 18 fotografías con nombres deterministas que incluyen lote, modelo y huella de contenido.
- `webp/pendientes/`: 13 fotografías convertidas, sin habilitar para asignación automática.
- `pendientes.md`: motivos de revisión para cada fotografía retenida.
- `manifest.json`: relación original → WebP, modelos propuestos, identidades locales, tamaños, huellas y estado de preparación.
- `source-review.json`: inventario de la entrega revisada utilizado como entrada; no modifica ni sustituye al Excel original.
- `imagenes-nuevas-webp.zip`: los 31 WebP organizados entre listas y pendientes.
- `contact-sheet.jpg`: vista de revisión de los WebP convertidos.

Diez fotografías nuevas tienen resolución pequeña. Se conservaron sus dimensiones sin ampliar artificialmente. La fotografía llamada `55A65NV` muestra 65 pulgadas y permanece retenida. También quedan pendientes las diferencias de código, la modificación de modelo de la freidora y las fichas repetidas anteriores.

## Procedimiento de carga

La carga requiere comprobar una coincidencia única de marca/modelo e identidad estable en Supabase. Se conservaron UUIDs, slugs, precios, inventario, disponibilidad, publicación e imágenes anteriores. No usar las identidades `excel-*` como UUIDs remotos. Las portadas y posiciones del manifiesto se aplicaron sólo a los 18 registros habilitados. `inspect-live-images.sql` valida sin modificar tablas persistentes; `apply-live-images.sql` verifica la presencia de los WebP en Storage y aplica la asignación de forma atómica, con comprobaciones antes del commit. El generador es `scripts/prepare-image-upload-sql.py`.

## Política del cliente

El usuario indicó conservar el texto original de la política de la marca, sin reescribirlo. La observación de revisión jurídica comunicada permanece documentada; este lote no modifica ni publica la política.

## Reproducir

Usar Python con Pillow y una carpeta de salida que todavía no exista:

```sh
python3 scripts/prepare-catalog-images.py '/ruta/Catálogo Mosqueta-2' \
  --review output/catalog-update-2026-10-20/source-review.json \
  --previous-manifest output/catalog-update-2026-10-17/manifest.json \
  --catalog src/data/products.generated.json \
  --output output/catalog-update-2026-10-20-reproduccion \
  --batch 20261020
```

La herramienta no inicia conexiones remotas. Si el inventario o una huella del original cambió después de la revisión, detiene la preparación para exigir una nueva revisión.
