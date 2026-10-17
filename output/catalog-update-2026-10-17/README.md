# Actualización del catálogo Mosqueta

Preparación: 17 de octubre de 2026.

## Archivos recibidos y preparados

- Excel original: 41 filas de artículos, equivalentes a 43 modelos distintos después de separar las alternativas.
- Fotografías: 31 archivos para 11 modelos.
- Originales: 2,311,270 bytes. WebP: 701,588 bytes. Reducción: 69.6%.
- Conversión: calidad 82, lado máximo de 2000 px, sin ampliar imágenes pequeñas y conservando la orientación.
- Los archivos originales recibidos permanecen intactos.

## Cruce por modelo/SKU

`manifest.json` documenta cada archivo original, modelo, portada, orden, dimensiones, peso y huella SHA-256.
Se ignoran espacios, guiones y barras únicamente al buscar coincidencias. El modelo comercial original se conserva como SKU, sin sufijos inventados ni números de fila.

- 39 modelos tienen una coincidencia única con el catálogo local anterior.
- 2 modelos aparecen repetidos con información distinta: `RR16D6AGX1` y `RME360FDMRQ0`.
- 2 modelos no coinciden exactamente con códigos anteriores: `RME360PVMRE0` y `MCL2440PPDG0`. Requieren revisión antes de crear o renombrar fichas.
- De las 31 imágenes, 28 corresponden a 10 modelos con coincidencia única. Las 3 de `RR16D6AGX1` quedan preparadas sin asignación automática.
- `WK-5915/BD` no trae una imagen llamada Portada; se eligió la fotografía frontal sin sufijo, revisada visualmente.

## Carga remota

La carga se aplicó el 17 de octubre de 2026 al proyecto `doszumktrvomebkupeax`: 31 WebP subidos, 39 variantes actualizadas, 28 imágenes vinculadas y 10 galerías con sus nuevas portadas. La comprobación posterior confirmó cero discrepancias SKU/modelo y cero cambios en precios, inventario, disponibilidad, publicación y URLs de las variantes afectadas. El resultado está registrado en `application-result.json`.

Las propuestas de los modelos repetidos están en `fichas-para-revision.md`. Sus tres imágenes de `RR16D6AGX1` ya están en el bucket, pero no se vincularon a una ficha hasta revisar su consolidación.

Procedimiento preparado para una repetición controlada:

1. Verificar que el proyecto remoto sea `doszumktrvomebkupeax` y que las tablas del catálogo estén disponibles.
2. Ejecutar `inspect-live-catalog.sql`. No modifica tablas persistentes. El respaldo usado en esta sesión se guarda dentro de los metadatos de cada producto afectado, con la clave `client_import_20261017_before`.
3. Subir los WebP de `upload/` a la raíz del bucket existente `catalog-products`. Los nombres incluyen la huella del contenido para evitar sobrescrituras.
4. Ejecutar `apply-catalog-update.sql` solamente después de revisar el cruce remoto. Es una transacción: exige una coincidencia única por modelo y la presencia de los WebP en Storage.
5. Comprobar 39 variantes actualizadas, 28 imágenes registradas y 10 galerías actualizadas, y verificar las portadas en la tienda.

La transacción conserva UUIDs, URLs existentes, precios, inventario, disponibilidad, publicación e imágenes anteriores. Guarda el estado anterior de los registros afectados dentro de sus metadatos para facilitar la recuperación. No archiva artículos ausentes del nuevo Excel ni aplica cambios a los modelos pendientes.

El documento de cambios y devoluciones recibido no forma parte de esta carga de productos e imágenes.

## Repetir la preparación

Usar el Python del entorno de documentos que tenga Pillow y openpyxl:

```sh
python3 scripts/prepare-catalog-update.py '/ruta/Catálogo Mosqueta' --output output/catalog-update-2026-10-17
```

La preparación es local y no inicia conexiones ni escrituras remotas.
