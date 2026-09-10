# Seguimiento del proyecto Mosqueta

Última actualización: 9 de septiembre de 2026.

Este documento separa lo terminado, lo pospuesto por decisión del equipo y la información que todavía debe solicitarse al cliente. Debe actualizarse después de cada bloque de trabajo.

## Estado actual

- Branding y dirección visual: aprobados.
- Sitio público y modelo visual: implementados.
- Catálogo conectado a Supabase: implementado.
- Panel administrativo de productos: implementado.
- Alta, edición, archivo, precios, inventario y publicación: implementados.
- Galería administrativa: visualización, carga múltiple, WebP, orden, portada, texto alternativo, reemplazo y eliminación implementados.
- Galería pública: imágenes ordenadas, miniaturas, navegación móvil y vista ampliada implementadas.
- Carrito: persistencia local, cantidades, eliminación, contador y totales implementados.
- Checkout de invitado: contacto, entrega, resumen, redirección segura a Stripe y confirmación de pago implementados y publicados.
- Stripe en modo de prueba: compra exitosa por $30,000 realizada por el equipo; validación visual del retorno completada.
- Gestor administrativo de pedidos: publicación confirmada mediante sesión autenticada el 9 de septiembre de 2026. Muestra 5 pedidos (3 pagados y 2 pendientes); búsqueda, filtros, detalle y guardado de estado revisados. Pedido QA `MOS-2026-000001` actualizado a Confirmado tras aplicar la corrección.
- Base de pedidos en Supabase: aplicación de tablas, historial, idempotencia y RLS registrada en el seguimiento previo; no reverificada contra el entorno remoto en esta sesión.
- Corrección de permisos operativos: migración `202609090001_order_fulfillment_permissions.sql` aplicada manualmente mediante SQL Editor en el proyecto Supabase `doszumktrvomebkupeax`, con autorización del usuario. Función verificada con SECURITY DEFINER, search_path vacío y sin ejecución para anon. Las 12 comprobaciones locales aprobaron; el guardado remoto confirmó estado, nota y autor, sin duplicar historial al repetirlo y sin alterar el pago.
- Validación técnica local: ESLint, TypeScript y build de producción aprobados el 9 de septiembre de 2026 con los cambios actuales, incluida la confirmación de pago.
- Confirmación de pago endurecida para aceptar únicamente sesiones en MXN creadas por el checkout de Mosqueta.
- QA del detalle: diferencia horaria entre listado/detalle y miniatura rota reproducidas. Correcciones locales listas (zona America/Mexico_City y URL local para imágenes del propio sitio); publicación pendiente.
- Precios temporales para QA: pantallas de 55″ ($30,000), 65″ ($40,000) y 75″ ($50,000).
- Despliegue de producción en Vercel: activo.

## Puntos que estamos posponiendo

| Punto pospuesto | Motivo actual | Condición para retomarlo |
| --- | --- | --- |
| Prueba real de carga con 2 o 3 imágenes | El equipo decidió no hacer pruebas todavía | Contar con imágenes finales autorizadas y seleccionar un producto de prueba |
| Prueba real de orden y cambio de portada | Depende de tener varias imágenes reales cargadas | Realizar junto con la prueba de carga |
| Revisión UX/UI completa del CRUD | Se realizará cuando termine la funcionalidad administrativa | Ejecutar en escritorio y móvil con datos reales |
| Prueba integral del CRUD | Todavía no se harán pruebas destructivas o de datos reales | Definir producto de prueba y criterios de aceptación |
| Carga y revisión final de precios | Los precios serán definidos por el equipo/cliente | Recibir archivo definitivo de precios y reglas de IVA |
| Sustitución de precios temporales de pantallas | Los valores actuales existen únicamente para probar el carrito | Reemplazarlos antes de conectar el dominio final |
| Validación del webhook de Stripe | El retorno del pago ya se probó, pero falta confirmar la entrega HTTP 200 en Workbench | Revisar o reenviar `checkout.session.completed` después de publicar la persistencia |
| Prueba integral del gestor de pedidos | Guardado e historial del pedido QA aprobados en el sitio publicado; revisión móvil y mejoras visuales pendientes | Publicar las mejoras de presentación y cerrar QA responsive |
| Activación comercial del checkout | La integración de prueba está lista, pero faltan reglas y documentos finales | Recibir aviso de privacidad, destinatario de pedidos, políticas y cobertura definitiva |
| Activación de Stripe en producción | Actualmente se usarán claves y webhook de prueba | Completar validación de cuenta, definir métodos, comisiones, MSI y reembolsos; después cambiar a claves `live` |
| Sustitución de imágenes de referencia | Faltan imágenes finales del cliente | Recibir y validar fotografías finales |
| QA público completo | Debe hacerse con catálogo, precios e imágenes finales | Completar contenido y después probar navegación, SEO y responsive |

## Información que debemos pedir al cliente

### 1. Catálogo definitivo

- Archivo maestro con todos los productos que deben publicarse.
- SKU o clave interna única por producto/variante.
- Marca, categoría y subcategoría.
- Modelo comercial y modelo del fabricante.
- Nombre comercial definitivo.
- Descripción corta y descripción completa.
- Especificaciones técnicas en campos claros.
- Colores, medidas, capacidades y variantes disponibles.
- Productos que deben ocultarse, archivarse o destacarse.

### 2. Precios e inventario

- Precio final de cada SKU.
- Confirmación de si los precios incluyen IVA.
- Existencia inicial o indicación de “sobre pedido”.
- Productos agotados o temporalmente no disponibles.
- Frecuencia y responsable de actualizar existencias.
- Promociones, descuentos o precios especiales, si aplican.

### 3. Imágenes

- Fotografías finales por producto, sin marcas de agua ajenas.
- Mínimo recomendado: 2 a 5 imágenes por producto.
- Indicación de cuál debe ser la portada.
- Fotografías de variantes de color o tamaño, cuando cambien visualmente.
- Permiso o confirmación de derechos para publicar las imágenes.
- Logos de marcas en buena resolución, si se utilizarán.
- Convención sugerida de archivos: `SKU-01`, `SKU-02`, `SKU-03`.

### 4. Operación comercial

Decisiones confirmadas: compra como invitado para la primera versión, cobertura inicial en CDMX y área metropolitana, intención de incluir la entrega en el precio y Stripe como pasarela principal. La transferencia quedará como alternativa secundaria.

- Lista exacta de alcaldías, municipios y códigos postales con cobertura.
- Confirmación final de cuándo la entrega está incluida y qué excepciones tendrán costo.
- Tiempos estimados de entrega.
- Opciones de recolección, si existen.
- Acceso a la cuenta de Stripe y definición de tarjetas, meses sin intereses y transferencia secundaria.
- Proceso para productos sobre pedido.
- Política de cancelaciones, devoluciones y cambios.
- Garantías por producto o marca.
- Responsable que recibirá solicitudes o pedidos.

### 5. Datos de contacto y confianza

- WhatsApp comercial definitivo.
- Correo de ventas y correo de atención.
- Teléfono público.
- Domicilio o sucursales que deban mostrarse.
- Horarios de atención.
- Redes sociales oficiales.
- Razón social y datos fiscales que deban aparecer.
- Aviso de privacidad, términos y condiciones y políticas comerciales.

### 6. Lanzamiento y medición

- Dominio definitivo y responsable de sus accesos.
- Cuenta de Google Analytics y Search Console, si ya existen.
- Pixel o herramientas publicitarias, si se utilizarán.
- Personas autorizadas para usar el panel administrativo.
- Responsable del visto bueno final antes de publicar.

## Mensaje sugerido para el cliente

> Hola, Ceci. Para completar el catálogo y preparar la revisión final del sitio necesitamos el archivo definitivo de productos con SKU, modelo, descripción, especificaciones, precio, IVA, disponibilidad y existencia. También necesitamos de 2 a 5 imágenes finales por producto, indicando cuál debe ser la portada y confirmando que pueden publicarse. Por favor compártenos además los datos comerciales finales: WhatsApp, correo, horarios, cobertura y costos de envío, métodos de pago, garantías, devoluciones, aviso de privacidad y términos. Si algún dato todavía no está definido, indícanos quién lo confirmará y una fecha estimada.

## Próximo bloque recomendado

El gestor ya está publicado y el cambio de estado quedó validado en Supabase y en el panel. El siguiente bloque es publicar los ajustes locales de confirmación, fechas e imágenes, cerrar QA móvil y verificar el recorrido de compra y entrega HTTP 200 del webhook. Antes de aceptar pagos reales se cerrarán cobertura, entrega, aviso de privacidad, destinatario de pedidos, políticas comerciales y claves de producción. La revisión UX/UI integral se hará sobre el recorrido completo.
