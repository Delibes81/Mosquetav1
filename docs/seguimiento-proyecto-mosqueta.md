# Seguimiento del proyecto Mosqueta

Última actualización: 1 de septiembre de 2026.

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
- Checkout de invitado en modo revisión: contacto, entrega, método de pago y resumen implementados sin envío ni almacenamiento de datos.
- Precios temporales para QA: pantallas de 55″ ($1,000), 65″ ($1,500) y 75″ ($2,000).
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
| Activación del checkout | La interfaz no guarda ni envía datos personales | Recibir aviso de privacidad, destinatario de pedidos y reglas comerciales finales |
| Conexión de Stripe | Stripe fue confirmado como pasarela principal, pero aún no está conectado | Recibir acceso a la cuenta, claves de prueba/producción y definir métodos, comisiones, MSI y reembolsos |
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

El siguiente bloque es solicitar y cerrar las reglas que activarán el checkout: cobertura exacta, entrega, aviso de privacidad, destinatario de pedidos y acceso a Stripe. Después se podrá crear el registro de pedidos en Supabase, notificaciones, webhooks y conexión de pago. La revisión UX/UI integral se hará sobre el recorrido completo.
