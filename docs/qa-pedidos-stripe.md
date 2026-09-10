# Verificación de pedidos y Stripe

Fecha de preparación: 8 de septiembre de 2026.

Actualización técnica: 9 de septiembre de 2026.

Esta lista valida el recorrido completo sin aceptar pagos reales. Debe ejecutarse en un despliegue con claves de prueba de Stripe y un producto temporal autorizado para QA.

## 1. Preparación del entorno

- [ ] La migración `supabase/migrations/202609010001_orders.sql` está aplicada en el proyecto correcto de Supabase.
- [x] La migración correctiva `supabase/migrations/202609090001_order_fulfillment_permissions.sql` está aplicada después de la anterior. Aplicada manualmente mediante SQL Editor en `doszumktrvomebkupeax` con autorización del usuario.
- [ ] `CATALOG_DATA_SOURCE` tiene el valor `supabase`.
- [ ] `NEXT_PUBLIC_SITE_URL` coincide exactamente con la URL del despliegue.
- [ ] `STRIPE_SECRET_KEY` corresponde al modo de prueba.
- [ ] `STRIPE_WEBHOOK_SECRET` pertenece al endpoint configurado para este despliegue.
- [ ] El endpoint de Stripe apunta a `https://TU-DOMINIO/api/stripe/webhook` y escucha `checkout.session.completed`.
- [ ] Existe un usuario administrativo activo con acceso a `/admin/pedidos`.
- [ ] Existe al menos un producto publicado, con precio temporal, disponibilidad de compra y existencia suficiente.

No copies valores secretos en capturas, tickets ni documentos de seguimiento.

## 2. Comprobaciones antes de comprar

- [ ] La ficha muestra el precio esperado y permite agregar el producto al carrito.
- [ ] El carrito conserva el producto al recargar la página.
- [ ] El total del carrito coincide con precio por cantidad.
- [ ] El checkout muestra entrega incluida y señala claramente que el pago está en modo de prueba.
- [ ] Una cantidad superior a la existencia es rechazada por el servidor.
- [ ] Un producto agotado, sin publicar o sin precio válido no puede iniciar el pago.

## 3. Compra de prueba

- [ ] Completar los datos de contacto y una dirección de QA.
- [ ] Continuar a Stripe y comprobar nuevamente descripción, cantidad, moneda MXN y total.
- [ ] Pagar utilizando un método de prueba autorizado por Stripe; nunca introducir una tarjeta real.
- [ ] Confirmar que Stripe regresa a `/checkout/exito`.
- [ ] La página muestra “Pago confirmado”, el importe correcto y el correo esperado.
- [ ] El carrito se limpia solamente después de confirmar una sesión pagada creada por Mosqueta.

Registrar para conciliación el horario de la prueba, el número de pedido, el identificador de la sesión y el identificador del Payment Intent. No registrar datos de tarjeta.

## 4. Webhook y persistencia

- [ ] En Stripe Workbench, `checkout.session.completed` muestra entrega HTTP `200`.
- [ ] Si la primera entrega falló, reenviar el mismo evento y confirmar que responde correctamente.
- [ ] El reenvío no duplica el pedido, el pago ni el registro del historial.
- [ ] El pedido queda con `payment_status = paid`.
- [ ] El total y la moneda almacenados coinciden con Stripe.
- [ ] El pedido conserva las partidas, cantidades, precios y datos de entrega capturados al iniciar el checkout.

## 5. Panel administrativo

- [ ] El pedido aparece en `/admin/pedidos` sin necesidad de cerrar sesión.
- [ ] La búsqueda funciona por número de pedido, cliente y correo.
- [ ] Los filtros de pago y operación producen resultados coherentes.
- [ ] El detalle muestra productos, total, contacto, domicilio y referencias.
- [ ] La liga del Payment Intent abre el registro correcto en el modo de prueba de Stripe.
- [x] Cambiar el estado de `Nuevo` a `Confirmado` y agregar una nota interna (pedido QA `MOS-2026-000001`).
- [x] El nuevo estado aparece en el listado y en el detalle.
- [x] El historial conserva el cambio, nota y fecha; consulta directa confirma autor registrado.
- [ ] Revisar listado, filtros, detalle y formulario en escritorio y en móvil.

## 6. Criterio de aprobación

El bloque queda aprobado cuando la compra termina en Stripe, el webhook entrega `200`, el pedido pagado aparece una sola vez en el panel y el cambio de estado queda registrado. Cualquier diferencia de total, moneda, identidad del pedido o duplicación bloquea la publicación.

Cambiar a claves reales queda fuera de esta prueba. Antes de hacerlo deben estar aprobadas la cobertura, entrega, privacidad, términos, devoluciones, responsable de pedidos y configuración comercial de Stripe.

## Prueba local reproducible de permisos

Ejecutada el 9 de septiembre de 2026: 12 comprobaciones aprobadas con PGlite 0.5.8 (PostgreSQL en memoria). El script carga las migraciones reales de catálogo, administración y pedidos. Simula únicamente los roles y la identidad de Supabase; omite la extensión pgcrypto porque `gen_random_uuid` ya está disponible. No usa credenciales ni modifica datos externos.

En macOS, se puede instalar el motor de pruebas fuera del proyecto y ejecutar:

```sh
qa_dir=$(mktemp -d /private/tmp/mosqueta-db-qa.XXXXXX)
npm install --prefix "$qa_dir" --no-package-lock --ignore-scripts @electric-sql/pglite@0.5.8
node scripts/test-order-permissions.mjs "$qa_dir/node_modules/@electric-sql/pglite/dist/index.js"
```

La prueba reproduce el fallo original antes de aplicar la corrección y comprueba administrador, editor, usuario inactivo, usuario sin rol y anónimo; verifica autor, notas, historial sin duplicados y bloqueo de escrituras directas. No sustituye la prueba autenticada del panel ni la compra con Stripe.

## Revisión autenticada del entorno publicado — 9 de septiembre de 2026

- Gestor accesible con sesión administrativa: 5 pedidos, 3 pagados y 2 pendientes. Esto confirma que el gestor ya está publicado.
- Búsqueda por `MOS-2026-000001`: un resultado. Filtro Pagado: tres resultados. Combinación Pagado/Confirmado: estado sin resultados; filtros restaurados al terminar.
- Pedido `MOS-2026-000001`, identificado como “Prueba Mosqueta QA” y “No surtir”: detalle e historial accesibles, sesión Stripe en modo de prueba y evento de confirmación del webhook presente. Esto no verifica por sí solo la entrega HTTP 200 en Stripe Workbench.
- Intento de cambio Nuevo → Confirmado con nota QA: retorno `?error=estado`, mensaje de error y estado Nuevo conservado. La nota no quedó registrada.
- Defectos visuales reproducidos: fecha del listado 5/sep 22:34 frente a detalle 6/sep 04:34, y miniatura del producto sin cargar. Corregidos localmente con zona horaria explícita y normalización de la URL del propio sitio. ESLint, TypeScript y build aprobados; Next Image acepta la ruta normalizada y el archivo existe.
- Revisión móvil pendiente: el control de viewport no produjo el ancho solicitado; la inspección del DOM siguió indicando 862 px. No se marca como validada.

## Resultado después de aplicar la corrección

Migración aplicada con autorización del usuario sobre `webEcommerce` (`doszumktrvomebkupeax`). La consulta previa confirmó la función original y su validación de `is_catalog_admin()`. La consulta posterior confirmó SECURITY DEFINER, search_path vacío y permisos de ejecución sólo para postgres, authenticated y service_role (anon revocado).

El pedido QA `MOS-2026-000001` pasó de Nuevo a Confirmado desde el panel y regresó con `?updated=1`. Se registró la nota “QA técnico: guardado verificado tras corregir permisos. Pedido de prueba, no surtir.” Repetir el guardado mantuvo un solo evento operativo. La conciliación SQL devolvió `payment_status=paid`, `fulfillment_status=confirmed`, `operational_events=1` y `author_recorded=true`. El listado refleja Confirmado y dos pedidos pagados nuevos por atender. Ningún otro pedido se modificó.

Aplicación manual: este paso no registró una versión en el historial de Supabase CLI. Los ajustes locales de presentación y confirmación siguen pendientes de publicación; la revisión móvil y la entrega HTTP 200 del webhook permanecen abiertas.
