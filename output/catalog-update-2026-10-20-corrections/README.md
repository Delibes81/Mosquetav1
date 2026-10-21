# Correcciones de códigos e imágenes autorizadas

Aplicadas y verificadas el 20 de octubre de 2026 sobre Supabase `doszumktrvomebkupeax`.

El usuario confirmó que las diferencias 0/O y los caracteres faltantes o cambiados eran errores de captura. Autorizó vincular la freidora `CKSTAF60WDDF` con la ficha existente DiamondForce. La selección de la fotografía de TV se registró por separado en el lote `catalog-update-2026-10-20-tv-65`.

- 12 WebP subidos y vinculados a 11 galerías, conservando las 12 imágenes anteriores.
- Corregidos 4 códigos de fabricante: DiamondForce → CKSTAF60WDDF, MCL2440PSDG0 → MCL2440PPDG0, RME360PVMRM0 → RME360PVMRE0 y RMS-510VMREO → RMS-510VMRE0.
- Cambiados 6 SKUs para reflejar el modelo aprobado; los otros dos corresponden a RR16D6AGX1 y RME360FDMRQ0, que todavía tenían claves MOSQ-EXCEL.
- Se conservaron UUIDs, URLs, precios, inventario, disponibilidad, publicación, colores y especificaciones. Las portadas finales existentes se conservaron; en particular, la foto adicional de MCL2440PSBB0 se agregó después de su portada ya publicada.
- RR16D6AGX se asignó a la ficha existente de Frigobar de 45 L, referencia `excel-30`. No se fusionó ni modificó la ficha duplicada `excel-71`.
- RME360FDMRQ0 recibió la fotografía en su única ficha existente, sin mezclar las descripciones distintas de las dos filas del Excel.
- Las tres fotos de RR16D6AGX1 preparadas en el lote del 17 de octubre siguen sin asignación; este bloque atendió las 13 fotos nuevas que estaban pendientes, no la consolidación de sus fichas históricas.
- Verificados los 12 archivos públicos por HTTP, MIME WebP y SHA-256. Las 11 fichas públicas devolvieron HTTP 200 y mostraron el modelo aprobado y las imágenes nuevas.

La transacción guardó el estado anterior en `catalog_products.metadata.client_corrections_20261020_before`. No se tocaron las políticas comerciales. `application-result.json` conserva los resultados de la transacción y de la comprobación pública; `diamondforce-publicada.jpg` muestra la freidora publicada.

La preparación local reproducible usa `scripts/prepare-approved-image-corrections.py`, el manifiesto del lote inicial, su `approved-corrections.json` y el catálogo local de identidades como referencia. `inspect.sql` valida sin modificar tablas persistentes; `apply.sql` aplica sólo las equivalencias aprobadas, exige los WebP en Storage y comprueba campos protegidos antes del commit. No ejecutar este lote para corregir códigos diferentes sin una nueva aprobación explícita.
