# Planner de ejecución - E-commerce B2C Mosqueta

**Fecha de auditoría:** 27 de agosto de 2026  
**Ventana comprometida en la propuesta:** 8 a 10 semanas  
**Estado comercial:** aprobado  
**Estado de branding y dirección visual:** aprobado  
**Estado técnico actual:** catálogo real conectado a Supabase y primer corte del panel administrativo implementado; falta completar contenido transaccional, carrito, checkout, pedidos y lanzamiento

## 1. Objetivo del proyecto

Convertir el prototipo aprobado en una sucursal digital B2C lista para producción, con catálogo inicial de 70 productos, variantes y existencias, carrito y checkout seguro, pagos con Stripe, pedidos, notificaciones, panel operativo, analítica, SEO y controles de seguridad.

La meta no es rediseñar la marca ni replantear el look. El trabajo parte de la identidad y de las pantallas ya aprobadas, y se concentra en datos reales, lógica de negocio, operación, calidad y lanzamiento.

## 2. Alcance aprobado que sirve como contrato técnico

### Fase 1 - Frontend transaccional y rendimiento

- UI/UX a la medida enfocada en conversión.
- Rendimiento y Core Web Vitals.
- Optimización y carga diferida de imágenes.

### Fase 2 - Backend, catálogo y variantes

- Supabase como base de datos e infraestructura de contenido.
- Carga inicial de 70 productos.
- Variantes complejas vinculadas con existencias.
- SEO automático: metadatos, Open Graph y sitemap.

### Fase 3 - Pagos y seguridad transaccional

- Stripe mediante Payment Intents.
- Webhooks verificados para confirmar pagos y descontar existencias.
- Notificaciones transaccionales por correo.

### Fase 4 - Operación y analítica

- Panel administrativo para productos, inventario y pedidos.
- Google Analytics 4.
- Eventos B2C: `view_item`, `add_to_cart` y `purchase`.

### Fuera del backlog principal

- El branding ya está desarrollado y aprobado.
- La dirección visual del sitio ya está aprobada.
- Cambios de identidad o rediseños mayores se consideran cambio de alcance.

## 3. Auditoría del repositorio actual

| Área | Estado | Evidencia actual | Trabajo pendiente |
|---|---|---|---|
| Identidad visual | Aprobada | Logotipos, paleta rosa/morado y aplicaciones incluidas en el PDF y en `public/` | Normalizar archivos finales, formatos y reglas de uso web |
| Home y navegación | Parcial | Home, encabezado, pie, banners y animaciones implementados | Datos reales, accesibilidad, rendimiento, enlaces válidos y estados de error |
| Catálogo | Funcional inicial | 72 productos publicados desde Supabase, búsqueda, filtros, orden y paginación | Precio, stock, imágenes finales y aprobación del surtido |
| Producto | Funcional inicial | 72 rutas por slug generadas desde Supabase | Galería final, selector de variantes, stock/precio definitivo y SEO estructurado |
| Carrito | Demo | Dos artículos fijos y resumen visual | Estado persistente, cantidades, variantes, validación de stock, impuestos y envío |
| Checkout | No iniciado | El botón existe sin flujo | Datos del comprador, dirección, entrega, resumen, Stripe y confirmación |
| Inventario | No iniciado | Sin modelo ni fuente de datos | SKU/variante, existencias, reservas, movimientos, concurrencia y ajustes |
| Pedidos | No iniciado | Sin modelo ni estados | Creación idempotente, historial, estados, datos de pago y operación |
| Stripe | No iniciado | Solo se menciona en textos | Payment Intents, Elements, webhooks, pruebas, producción y conciliación |
| Correos | No iniciado | Sin proveedor ni plantillas | Confirmación, pago, pedido, cancelación y avisos operativos |
| Backoffice | Funcional inicial | Login SSR, roles, RLS, listado, alta, edición, precio, stock, publicación y archivado | Activar primer usuario, probar CRUD autenticado, imágenes y módulo de pedidos |
| Formularios | Demo | Contacto y corporativo no envían | Validación, envío, antispam, consentimiento y destino operativo |
| GA4 | No iniciado | Sin etiqueta ni eventos | Consentimiento, configuración, ecommerce events y validación en DebugView |
| SEO | Inicial | Metadatos básicos en algunas páginas | Metadata dinámica, canonical, OG, JSON-LD, sitemap, robots y páginas legales |
| Calidad | Bloqueada | No hay pruebas automatizadas | Unitarias, integración, E2E, accesibilidad, rendimiento y UAT |
| Lanzamiento | No iniciado | No hay configuración documentada | Entornos, secretos, dominio, monitoreo, respaldos, runbook y capacitación |

### Avance de implementación - Fundación Supabase

- Cliente oficial de Supabase instalado y encapsulado para lecturas públicas.
- Migración preparada para marcas, categorías, productos, variantes, imágenes y movimientos de inventario.
- RLS y privilegios de mínimo acceso definidos; visitantes únicamente pueden leer catálogo activo/publicado.
- Vista pública configurada con `security_invoker = true` para respetar RLS.
- Importador idempotente preparado para 73 registros técnicos: 72 publicados y 1 borrador por duplicidad.
- Precios, stock y disponibilidad quedan fuera de las actualizaciones del importador para proteger la captura manual.
- Catálogo conectado mediante una capa conmutada y activado con `CATALOG_DATA_SOURCE=supabase`.
- Migración ejecutada en el proyecto remoto e importación completada: 73 registros técnicos, 72 públicos y 1 borrador preventivo.

### Avance de implementación - Panel administrativo

- Supabase Auth integrado mediante sesiones SSR por cookies y `proxy.ts` de Next.js 16.
- Tabla de usuarios administrativos con roles `admin` y `editor`.
- RLS de mínimo privilegio y verificación de autorización en cada Server Action.
- Rutas dinámicas `/admin/login`, `/admin/productos`, alta y edición por variante.
- CRUD inicial con búsqueda, filtros, precio, stock, disponibilidad, publicación y archivado recuperable.
- Altas y actualizaciones ejecutadas de forma atómica mediante funciones Postgres.
- Cambios de existencia registrados automáticamente en `inventory_movements`.
- Script `pnpm admin:grant` preparado para activar usuarios existentes de Supabase Auth.
- Pendiente inmediato: crear/asignar la primera cuenta y ejecutar la prueba autenticada de punta a punta.

### Hallazgos técnicos inmediatos

- `pnpm lint` falla con 2 errores y reporta 2 advertencias.
- `pnpm build` no concluye en el entorno auditado porque las fuentes de Google se descargan durante el build; conviene alojar localmente las fuentes aprobadas para obtener builds reproducibles.
- Hay nueve enlaces del pie que hoy terminan en rutas inexistentes.
- El contador del carrito, sus productos y sus totales están fijos en código.
- Los botones de agregar, eliminar, cambiar cantidad, buscar, pagar y enviar formularios no tienen operación real.
- No existen rutas API, migraciones, variables de entorno documentadas, pruebas ni integración con Supabase, Stripe, correo o GA4.
- Las imágenes de producto actuales son referencias externas de demostración y deben reemplazarse por material aprobado del cliente.

### Auditoría de los insumos de catálogo recibidos

Se recibieron un Excel operativo y un PDF comercial. Sirven para iniciar la depuración del catálogo, pero todavía no constituyen una fuente importable ni una relación confiable de imágenes por SKU.

| Insumo | Resultado de la revisión | Implicación |
|---|---|---|
| Excel de productos | 69 filas con artículo, marca, modelo, color, tamaño y especificaciones | Es una buena base descriptiva, pero faltan campos transaccionales y logísticos |
| Calidad del Excel | 18 filas sin color y 57 sin tamaño; dimensiones, peso y garantía aparecen de forma parcial dentro de texto libre | Los atributos deben normalizarse antes de diseñar filtros, variantes y envíos |
| Modelos duplicados | `LMA72215WBAB1` está repetido de forma idéntica; `RR16D6AGX1` identifica dos descripciones distintas | Ceci debe confirmar si son duplicados o modelos mal capturados |
| Modelos alternativos | Cuatro televisores contienen dos modelos en una sola celda | Cada modelo vendible debe convertirse en un SKU/variante independiente |
| PDF comercial | 48 fichas visuales sin precio ni número de modelo visible | No puede usarse como maestro de datos ni para asociar imágenes automáticamente |
| Cobertura PDF/Excel | 12 colchones se resumen en 3 fichas; 18 televisores en 9; 3 parrillas Panini en 1 | Se necesitan imágenes originales y una relación explícita archivo-SKU |
| Diferencias entre archivos | El PDF incluye un refrigerador Top Mount de 14 pies que no aparece claramente como tal en el Excel | El surtido final debe conciliase y aprobarse antes de cargarlo |

Conteo provisional: hay 69 filas, pero 67 códigos de modelo distintos después de considerar los dos modelos repetidos. Si los cuatro renglones de TV con alternativas representan dos productos cada uno, el universo sería de 71 SKUs posibles. El número final no debe fijarse hasta resolver esas ambigüedades con Mosqueta.

## 4. Decisiones e insumos obligatorios antes de cerrar arquitectura

Estas decisiones deben resolverse durante el kickoff. Si quedan abiertas, afectan la ruta crítica.

| ID | Decisión o insumo | Responsable principal | Fecha límite sugerida | Impacto si falta |
|---|---|---|---|---|
| D01 | Completar y aprobar el archivo maestro: la base recibida tiene 69 filas, pero aún faltan SKU definitivo, categoría, precio, IVA, estatus y conciliación de duplicados | Mosqueta | Día 3 | Bloquea catálogo real e importación |
| D02 | Matriz de variantes y existencias por SKU | Mosqueta | Día 3 | Bloquea inventario, ficha y checkout |
| D03 | Fotografías originales finales y relación explícita nombre-de-archivo/SKU; el PDF recibido solo sirve como referencia visual | Mosqueta | Día 5 | Bloquea QA visual, rendimiento y salida |
| D04 | Fuente oficial del stock y frecuencia de actualización | Mosqueta + TML | Día 3 | Define si el panel será maestro o si habrá sincronización |
| D05 | Zonas de entrega, tarifas, restricciones, tiempos y política para productos voluminosos | Mosqueta | Día 5 | Bloquea total final y checkout |
| D06 | Política fiscal: precios con/sin IVA, facturación y datos requeridos | Mosqueta | Día 5 | Bloquea cálculo, recibos y términos |
| D07 | Métodos de pago, meses sin intereses y cuenta Stripe de producción | Mosqueta | Semana 2 | Bloquea pruebas comerciales y go-live |
| D08 | Checkout como invitado y/o cuentas de cliente | Mosqueta + TML | Día 3 | Cambia autenticación, datos y alcance de UX |
| D09 | Estados operativos del pedido y quién puede cambiarlos | Mosqueta | Semana 2 | Bloquea backoffice y correos |
| D10 | Proveedor y remitente de correo transaccional | Mosqueta + TML | Semana 2 | Bloquea notificaciones |
| D11 | Textos legales: privacidad, términos, envíos, devoluciones, garantías y cookies | Mosqueta/Legal | Semana 4 | Bloquea producción |
| D12 | Accesos y propiedad de dominio, Vercel, Supabase, Stripe, GA4 y correo | Mosqueta + TML | Semana 2 | Bloquea configuración y transferencia |
| D13 | Datos reales de contacto, razón social y domicilio | Mosqueta | Semana 2 | Evita publicar placeholders |

## 5. Arquitectura objetivo

### Aplicación

- Next.js App Router y TypeScript.
- Componentes del sistema visual aprobado reutilizados y normalizados.
- Renderizado orientado a SEO para catálogo y producto.
- Carrito persistente y validado contra el servidor antes de pagar.

### Datos y archivos

- Supabase Postgres para productos, variantes, inventario, clientes operativos, pedidos, pagos y movimientos.
- Supabase Storage para imágenes de producto optimizadas.
- Migraciones versionadas, semillas de desarrollo y script de importación idempotente para los 70 productos.
- Políticas RLS de mínimo privilegio; ninguna operación administrativa desde el navegador sin autorización.

### Pagos y pedidos

- Stripe Payment Intents y Stripe Elements.
- El servidor calcula y valida precios; el navegador nunca decide el total final.
- Webhook con firma verificada e idempotencia.
- El pedido se confirma y el inventario se descuenta solo con un evento de pago válido.
- Registro de intentos, pagos, reembolsos operativos y errores de conciliación.

### Administración

- Acceso autenticado y roles operativos.
- Gestión de productos, variantes, imágenes, precio, estatus y existencias.
- Vista y actualización controlada de pedidos.
- Historial básico de movimientos de inventario y cambios relevantes.

### Analítica, privacidad y operación

- GA4 con eventos ecommerce y consentimiento según la política legal aprobada.
- Monitoreo de errores, salud de webhooks y fallos de correo.
- Separación de desarrollo, staging y producción.
- Secretos únicamente en el servidor y documentados sin valores reales.

## 6. Ruta de ejecución de 8 a 10 semanas

Las actividades se solapan. La ruta crítica es: **datos de producto -> modelo de variantes/stock -> carrito/checkout -> Stripe/webhooks -> UAT -> producción**.

| Semana | Objetivo | Entregables verificables | Puerta de salida |
|---|---|---|---|
| 1 | Kickoff y cimientos | Decisiones D01-D13 encaminadas, arquitectura, repositorio saneado, fuentes locales, entornos, variables y CI | Lint y build en verde; alcance funcional firmado |
| 2 | Modelo de datos e importación | Esquema Supabase, RLS inicial, migraciones, Storage, plantilla de carga y primer lote de productos | Producto, variante, SKU y stock se consultan desde staging |
| 3 | Catálogo real | Importación de 70 productos, categorías, búsqueda, filtros, orden y paginación | Catálogo completo revisado por Mosqueta |
| 4 | Ficha y carrito | Ficha dinámica, galería, variantes, disponibilidad, carrito persistente y validación de cantidades | Flujo catálogo -> producto -> carrito aprobado |
| 5 | Checkout y logística | Datos del comprador, dirección, reglas de entrega, impuestos, resumen final y creación preliminar de pedido | Total calculado por servidor y escenarios de envío aprobados |
| 6 | Stripe y pedidos | Payment Intents, Elements, webhooks, idempotencia, estados de pago/pedido y manejo de fallos | Compra completa en Stripe Test sin doble cobro ni doble descuento |
| 7 | Backoffice y correos | Acceso por rol, gestión de catálogo/stock/pedidos y correos transaccionales | Equipo Mosqueta procesa un pedido de prueba de punta a punta |
| 8 | SEO, GA4, contenido y legales | Metadata dinámica, OG, JSON-LD, sitemap, robots, eventos ecommerce, consentimiento y páginas legales | SEO técnico y eventos validados en staging |
| 9 | QA integral y UAT | E2E, integración, accesibilidad, responsive, seguridad, rendimiento, respaldo y correcciones | UAT firmado; cero defectos críticos/altos abiertos |
| 10 | Producción y estabilización | Dominio, servicios productivos, smoke test, monitoreo, documentación, capacitación y plan de rollback | Go-live aceptado y operación transferida |

Si todos los insumos llegan en la primera semana y no hay sincronización con un ERP externo, la ejecución puede comprimirse a 8-9 semanas. La semana 10 debe conservarse como estabilización cuando existan reglas logísticas complejas o retrasos de contenido.

## 7. Backlog priorizado

### P0 - Necesario para vender

- [x] P0.01 Corregir lint y asegurar build reproducible.
- [x] P0.02 Crear `.env.example` y validación de entorno. Pendiente separar staging/producción.
- [x] P0.03 Diseñar, versionar y aplicar el esquema inicial de Supabase.
- [x] P0.04 Implementar RLS, autenticación administrativa y roles. Pendiente activar el primer usuario.
- [x] P0.05 Crear y ejecutar importador validado e idempotente de productos/variantes.
- [ ] P0.06 Cargar y aprobar los 70 productos con imágenes finales.
- [x] P0.07 Sustituir catálogo fijo por consultas reales con búsqueda, filtros, orden y paginación.
- [ ] P0.08 Implementar ficha por slug. Datos dinámicos y disponibilidad listos; faltan variantes, precio final y SEO completo.
- [ ] P0.09 Implementar carrito persistente y validación de stock/precio en servidor.
- [ ] P0.10 Implementar dirección, logística, impuestos y resumen de checkout.
- [ ] P0.11 Implementar Stripe Payment Intents y Elements.
- [ ] P0.12 Verificar webhooks, idempotencia y descuento seguro de inventario.
- [ ] P0.13 Crear pedidos y estados operativos.
- [ ] P0.14 Enviar correos transaccionales y alertas de fallo.
- [ ] P0.15 Construir backoffice. CRUD inicial de catálogo/inventario listo; faltan imágenes, prueba autenticada y pedidos.
- [ ] P0.16 Implementar páginas legales y consentimiento.
- [ ] P0.17 Implementar y validar GA4 ecommerce.
- [ ] P0.18 Añadir pruebas críticas, UAT, monitoreo y runbook de lanzamiento.

### P1 - Necesario para una experiencia profesional

- [ ] P1.01 Autocompletado o validación de códigos postales según zonas de entrega.
- [ ] P1.02 Estados vacíos, esqueletos, reintentos y mensajes de error consistentes.
- [ ] P1.03 Búsqueda usable y sin resultados controlados.
- [ ] P1.04 Optimización de imágenes, fuentes, caché y métricas web.
- [ ] P1.05 Accesibilidad de teclado, foco, formularios, contraste y lectores de pantalla.
- [ ] P1.06 Formularios de contacto y corporativo con validación, antispam y trazabilidad.
- [ ] P1.07 Revisión editorial de todo el contenido y sustitución de datos de muestra.
- [ ] P1.08 Eliminar o implementar todos los enlaces hoy inexistentes.
- [ ] P1.09 Documentar operación, incidencias, respaldos y recuperación.

### P2 - Evolución posterior al lanzamiento

- [ ] P2.01 Cuentas de cliente, historial y repetición de pedido, si no entran en P0.
- [ ] P2.02 Cupones y promociones avanzadas.
- [ ] P2.03 Facturación automática e integración fiscal.
- [ ] P2.04 Sincronización con ERP o sistema externo de inventario.
- [ ] P2.05 Reseñas, favoritos y recuperación de carrito.
- [ ] P2.06 Automatizaciones de marketing y audiencias.

## 8. Criterios de aceptación por flujo

### Catálogo y producto

- Los 70 productos aprobados aparecen con SKU, categoría, precio, imágenes y estado correctos.
- Cada combinación de variante tiene identidad y stock propios.
- Filtros, búsqueda, orden y paginación preservan una URL compartible cuando corresponda.
- Un slug inválido muestra una página 404 útil y no datos ficticios.

### Carrito y checkout

- Agregar, editar y eliminar artículos funciona en móvil y escritorio.
- El carrito conserva variante, precio y cantidad; al volver se revalida contra el servidor.
- No se puede comprar una cantidad superior a la disponible.
- El total final incluye de forma explícita descuentos, impuestos y envío.
- Los errores de dirección, pago o inventario no crean pedidos confirmados falsos.

### Pago, pedido e inventario

- El pago completo funciona en modo de prueba y producción.
- La firma de Stripe se verifica y cada evento se procesa una sola vez.
- Reintentos del webhook no duplican pedidos ni movimientos de stock.
- Un pago fallido no descuenta inventario de forma definitiva.
- El pedido conserva una fotografía de precios, productos, cliente, entrega y pago.

### Backoffice

- Solo usuarios autorizados acceden.
- El equipo puede publicar/ocultar productos, editar datos permitidos y ajustar inventario.
- El equipo puede consultar, filtrar y actualizar pedidos según el flujo aprobado.
- Los cambios de inventario relevantes quedan rastreables.

### Analítica, SEO y calidad

- `view_item`, `add_to_cart`, `begin_checkout` y `purchase` llevan los parámetros acordados y no duplican compras.
- Cada producto publicado tiene título, descripción, canonical, OG y datos estructurados válidos.
- Sitemap y robots reflejan únicamente contenido publicable.
- Lint, typecheck, build y pruebas críticas pasan en CI.
- No quedan rutas rotas, placeholders ni defectos críticos/altos al aprobar UAT.
- Se cumplen los umbrales vigentes de Core Web Vitals en las plantillas críticas o se documenta cualquier excepción aceptada.

## 9. Casos mínimos de prueba

- Compra exitosa de producto simple.
- Compra exitosa de una variante específica.
- Cambio de stock entre carrito y pago.
- Producto agotado y variante agotada.
- Rechazo de tarjeta y reintento.
- Webhook duplicado y webhook fuera de orden.
- Pérdida de conexión durante confirmación.
- Dirección fuera de cobertura.
- Compra móvil y escritorio.
- Pedido visible en backoffice y correo recibido.
- Ajuste manual de inventario con registro.
- Navegación de catálogo, búsqueda sin resultados y slug inexistente.
- Rechazo/aceptación de consentimiento y comportamiento de GA4.

## 10. Responsabilidades

### The Mala Leche

- Arquitectura, implementación, migraciones, importador, integraciones y pruebas.
- Configuración de staging y producción.
- Seguridad técnica, observabilidad, documentación y capacitación.
- Presentar demos semanales y mantener este planner actualizado.

### Mosqueta

- Entregar y aprobar datos, imágenes, precios, stock, logística, impuestos y políticas.
- Proporcionar cuentas/credenciales mediante un canal seguro y conservar propiedad de los servicios.
- Nombrar una persona con autoridad para resolver decisiones y aceptar entregables.
- Ejecutar UAT operativo con usuarios reales del equipo.

### Conjunto

- Acordar criterios de aceptación y cambios de alcance.
- Revisar demos semanales.
- Autorizar paso de staging a producción.

## 11. Cadencia y control del proyecto

- **Reunión semanal de 30 minutos:** avance, demo, bloqueos y decisiones.
- **Actualización del tablero dos veces por semana:** estado, responsable y fecha objetivo.
- **Demo funcional cada viernes:** solo se reporta como terminado lo demostrable en staging.
- **Cambios de alcance:** se documentan con impacto en tiempo, costo y criterios de aceptación.
- **Semáforo:** verde sin bloqueo; amarillo con riesgo de menos de 3 días; rojo cuando la ruta crítica está detenida.

Estados recomendados para cada ticket: `Backlog -> Ready -> En desarrollo -> En revisión -> QA -> UAT -> Terminado`.

## 12. Hitos de aceptación

| Hito | Resultado | Aprobación requerida |
|---|---|---|
| M0 - Scope lock | Decisiones e insumos críticos cerrados | Mosqueta + TML |
| M1 - Catálogo real | 70 productos, variantes y stock en staging | Mosqueta |
| M2 - Compra completa | Pedido pagado de punta a punta en Stripe Test | Mosqueta + TML |
| M3 - Operación | Backoffice y correos usados por el equipo | Mosqueta |
| M4 - Release candidate | SEO, GA4, legal, seguridad, rendimiento y UAT aprobados | Mosqueta + TML |
| M5 - Go-live | Producción validada y monitoreada | Mosqueta |

## 13. Riesgos principales y mitigación

| Riesgo | Probabilidad/impacto | Mitigación |
|---|---|---|
| Datos de producto incompletos o inconsistentes | Alta/Alta | Plantilla única, validación automática, importación temprana y dueño de datos |
| Logística compleja para muebles/electrodomésticos | Alta/Alta | Reglas cerradas en semana 1 y pruebas por código postal/volumen |
| Stock cambia durante el pago | Media/Alta | Revalidación servidor, reserva definida, transacciones e idempotencia |
| Métodos de pago/MSI no habilitados en Stripe | Media/Alta | Verificar cuenta y elegibilidad en semana 2, no al final |
| Textos legales tardíos | Alta/Alta | Plantillas y fecha límite semana 4; producción bloqueada sin aprobación |
| Imágenes pesadas o tardías | Alta/Media | Especificación de entrega, pipeline de optimización y lotes tempranos |
| Alcance B2B se mezcla con B2C | Media/Media | Mantener formularios B2B separados del checkout y registrar cambios |
| Dependencia de fuentes o activos remotos | Media/Media | Alojar fuentes/activos críticos localmente y probar builds limpios |
| Webhook o correo falla sin visibilidad | Media/Alta | Logs estructurados, alertas, reintentos y conciliación operativa |

## 14. Próxima acción recomendada

Ejecutar primero un **sprint de normalización de catálogo** y enviar a Ceci una sola solicitud consolidada:

1. Confirmar el surtido final y resolver `LMA72215WBAB1`, `RR16D6AGX1`, los cuatro renglones de TV con modelos alternativos y el refrigerador Top Mount de 14 pies.
2. Entregar precio de venta, IVA, existencia inicial, disponibilidad (`en stock`, `sobre pedido` o `agotado`), plazo de entrega y estatus publicable por SKU.
3. Definir categoría/subcategoría y variantes vendibles; color y tamaño no deben quedar como texto ambiguo.
4. Entregar fotografías originales sin composición gráfica, nombradas por SKU, indicando portada y orden de galería.
5. Completar peso, alto, ancho y profundidad para reglas de envío de productos voluminosos.

Mientras Ceci completa esos datos, The Mala Leche puede ejecutar en paralelo el saneamiento técnico de la **Semana 1**: dejar build/CI en verde, crear entornos y preparar el esquema Supabase y el importador validado. La carga definitiva, los filtros y la lógica de inventario deben construirse sobre el maestro conciliado, no directamente sobre los dos archivos recibidos.
