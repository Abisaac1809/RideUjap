# Fase 1 — MVP de Movilidad

**Deadline:** miércoles 19 de agosto de 2026
**Objetivo:** construir y probar con estudiantes reales el flujo completo de punta a punta:

**Publicar → Buscar → Reservar → Contactar (WhatsApp) → Calificar**

📄 Especificación funcional completa: [PLAN-MVP-MOVILIDAD-UJAP.md](./PLAN-MVP-MOVILIDAD-UJAP.md) — alcance, motor de tarifa, modelo de datos, lógica de matching y flujos de usuario.
Este documento es el **plan de ejecución**: cómo se reparte ese alcance en módulos, en qué orden se implementan y qué queda decidido o pendiente.

---

## Alcance en una tabla

| Incluye ✅ | No incluye ❌ |
|---|---|
| Registro, login y perfil editable | Matching por horario de clases → [Fase 2](./02-FASE-HORARIOS.md) |
| Publicar viaje (sentido, punto, hora, puestos, modo de admisión) | Tracking en vivo → [Fase 2](./02-FASE-HORARIOS.md) |
| Tarifa sugerida por el sistema, editable por el conductor | Chat interno → [Fase 3](./03-FASE-LINEAS-PAGOS.md) |
| Buscar viajes a <5 km y ±30 min | Pago dentro de la app → [Fase 3](./03-FASE-LINEAS-PAGOS.md) |
| Reservar (automático o por solicitud) y gestionar admisión | Verificación con correo institucional → [Fase 2](./02-FASE-HORARIOS.md) |
| Contacto por WhatsApp al confirmarse la reserva | Viajes recurrentes → [Fase 2](./02-FASE-HORARIOS.md) |
| Mis viajes: pendientes e historial | |
| Calificación bidireccional ⚠️ *sin issue asignado* | |

---

## Módulos e issues

El trabajo se reparte en **cuatro módulos**, cada uno con su issue de backend y su issue de frontend. Los issues son la fuente de verdad del detalle de implementación; esta tabla es el mapa.

| Módulo | Backend | Frontend | Qué entrega |
|---|---|---|---|
| **Auth y Schema Base** | [#1](https://github.com/Abisaac1809/RideUjap/issues/1) | — | Better Auth + adapter de Drizzle, tabla `user` con campos del estudiante, schema de `viaje` y `reserva`, middleware de sesión |
| **Usuarios** | [#2](https://github.com/Abisaac1809/RideUjap/issues/2) | [#5](https://github.com/Abisaac1809/RideUjap/issues/5) | `GET`/`PATCH /me`; `authClient`, registro, login, sesión persistente y pantalla de perfil |
| **Viajes** | [#3](https://github.com/Abisaac1809/RideUjap/issues/3) | [#6](https://github.com/Abisaac1809/RideUjap/issues/6) | Motor de tarifa, `POST /viajes`, `GET /viajes/buscar`; formularios de publicar y buscar |
| **Reservas** | [#4](https://github.com/Abisaac1809/RideUjap/issues/4) | [#7](https://github.com/Abisaac1809/RideUjap/issues/7) | `POST /viajes/:id/reservar`, `PATCH /reservas/:id`, revelado de teléfono, `GET /mis-viajes`; reservar, gestionar solicitudes, mis viajes y botón de WhatsApp |

### Orden de implementación

```
#1 Auth + Schema Base ─┬─ #2 Usuarios BE ──── #5 Usuarios FE ─┬─ #6 Viajes FE
   (bloquea a todos)   │                                      │
                       ├─ #3 Viajes BE ───────────────────────┘
                       │       │
                       └───────┴─ #4 Reservas BE ──────────────── #7 Reservas FE
```

- **#1 va primero y bloquea todo lo demás.** Sin `user`, sin schema y sin sesión no hay ruta protegida posible.
- **#2 y #3 son paralelizables** una vez cerrado #1.
- **#4 depende de #1 y #3**: decrementa los asientos que define #3 y usa el schema de #1. Sus funciones puras (validación de estados de reserva, reglas de admisión) se pueden escribir antes, sin base de datos.
- **#5 va antes que #6 y #7**: sin sesión persistente en el móvil no se prueba ninguna pantalla autenticada.
- El punto de fricción conocido de #5 es que Better Auth usa cookies por defecto y en React Native/Expo hace falta el plugin de bearer/token. **Resolver eso antes de escribir pantallas.**

### Punto de corte de cada módulo

Con un solo día por delante, conviene saber de antemano cuándo un módulo está "suficientemente terminado" para desbloquear al siguiente. No es el criterio de aceptación final: es el mínimo que permite seguir.

| Módulo | Está listo para desbloquear cuando… |
|---|---|
| #1 Auth y Schema Base | Las migraciones corren, existe `user` con los campos custom, y una ruta protegida de prueba responde 401 sin sesión y 200 con ella |
| #2 Usuarios BE | `GET /me` devuelve el usuario de la sesión |
| #3 Viajes BE | `POST /viajes` persiste con `asientos_disponibles = asientos_totales` y `GET /viajes/buscar` devuelve resultados filtrados, aunque el orden por cercanía quede sin pulir |
| #4 Reservas BE | Se crea la reserva y el asiento baja de forma atómica |
| #5 Usuarios FE | La sesión persiste al reabrir la app — sin esto no se prueba ninguna pantalla posterior |
| #6 Viajes FE | Se publica un viaje y se ve la lista de resultados |
| #7 Reservas FE | El botón de WhatsApp abre con el número correcto |

### Plan de contingencia (propuesto)

Si el tiempo se acaba, este es el orden sugerido para recortar. El criterio es proteger el recorrido completo **publicar → buscar → reservar → WhatsApp**, que es lo único que demuestra que el concepto funciona:

1. **Calificación** — ya está fuera de los criterios de aceptación del plan y no tiene issue.
2. **Modo de admisión "por solicitud"** — dejar solo el modo automático. Se ahorra `PATCH /reservas/:id` y toda la pantalla de gestión de solicitudes del conductor.
3. **Historial en "mis viajes"** — mostrar solo pendientes/próximos.
4. **Foto de perfil** — el resto del perfil (nombre, apellido, teléfono) sí hace falta: el teléfono es lo que se revela al confirmar.
5. **Edición de la tarifa sugerida** — mostrarla calculada y fija. ⚠️ Recortar esto contradice un criterio de aceptación del plan; es el último recurso.

Lo que **no** se recorta bajo ninguna circunstancia: el registro/login, la publicación de viajes, la búsqueda con sus filtros, la reserva con decremento de asientos, y el revelado de teléfono con el link de WhatsApp.

---

## Reglas de negocio que atraviesan los módulos

Estas tres reglas se implementan en un módulo pero se verifican en varios; conviene tenerlas presentes al revisar cualquier PR de la fase.

**1. El teléfono no se expone hasta que la reserva está confirmada.**
`GET /viajes/buscar` devuelve datos del conductor **sin teléfono**. Solo con la reserva en estado `inscrita` o `aceptada` se revela, y de forma bidireccional, para armar el link `https://wa.me/58XXXXXXXXXX`.

**2. Los asientos no se sobrevenden.**
`asientos_disponibles` se inicializa igual a `asientos_totales` al publicar. El decremento debe ser atómico (transacción o update condicional) y un viaje lleno no acepta más reservas. Tampoco se admite doble reserva del mismo pasajero.

**3. La tarifa la sugiere el sistema, la decide el conductor.**
El backend calcula la sugerencia y la devuelve; persiste **la que confirme el conductor**. La tarifa queda fija en el viaje y es por pasajero.

```
costo_combustible          = distancia_km × 0.05
tarifa_sugerida_por_pasajero = (costo_combustible / puestos_ofrecidos) + comision_sugerida
```

> El combustible por viaje es diminuto (~$0.40). **La comisión, no el combustible, es lo que hace atractivo manejar** — ver la nota de diseño en la [sección 5.4 del plan](./PLAN-MVP-MOVILIDAD-UJAP.md).

---

## Decisiones cerradas en esta fase

| Decisión | Resolución |
|---|---|
| **Autenticación** | Better Auth con adapter de Drizzle. Correo libre (no institucional) + contraseña, con nombre, apellido y teléfono como campos requeridos |
| **Cálculo de distancia** | Haversine × factor 1.3, calculado directamente en la query SQL. **PostGIS y `ST_DWithin` quedan descartados para el MVP** — la sección 7 del plan los propone, pero el volumen de datos no lo justifica todavía y evitarlos ahorra una extensión de PostgreSQL |
| **Librería de mapas para el matching** | Ninguna. El filtro de cercanía es aritmética local; solo se geocodifica el punto del estudiante (la UJAP es coordenada fija hardcodeada) |
| **Contacto entre usuarios** | WhatsApp vía deep link. No se construye chat interno |
| **Moneda** | Cálculo y visualización en **USD**. El motor de tarifa opera sobre $0.5/litro y ~10 km/litro |
| **Modelo de datos** | El del plan (`user`, `viaje`, `reserva`). Reemplaza la tabla `viajes` de demo y el tipo `Viaje` del prototipo de la [Fase 0](./00-FASE-PREPARACION.md) |

## Decisiones abiertas

Ninguna bloquea el desarrollo de los módulos, pero deben cerrarse antes de la prueba con estudiantes reales:

- **Precios en Bs con tasa del [BCV](https://www.bcv.org.ve).** Todo el MVP calcula en USD. Mostrar el equivalente en bolívares es esperable para el usuario venezolano y hoy no está en ningún issue. Decidir si entra como ajuste de presentación en esta fase o pasa a la siguiente.
- **Plataforma de deploy:** [Railway](https://docs.railway.com) vs [Render](https://render.com/docs). Comparar precio del tier, PostgreSQL gestionado, región más cercana y despliegue de un monorepo Turborepo.
- **Selector de punto en mapa.** El input de dirección con geocoding es la vía rápida; el selector en mapa es mejor UX si el tiempo lo permite (issue #6). Si se elige mapa, decidir la librería: `react-native-maps`, Expo Maps o `@rnmapbox/maps`.
- **Tope suave de tarifa.** El plan recomienda avisar cuando la tarifa deja de parecerse a compartir gastos, sin bloquear. Falta definir el umbral.

---

## Criterios de aceptación

Los del [plan MVP](./PLAN-MVP-MOVILIDAD-UJAP.md), verificables de punta a punta sobre un dispositivo real:

- [ ] Un usuario puede registrarse con correo, contraseña, nombre, apellido y teléfono
- [ ] Un usuario puede ver y editar su perfil
- [ ] Un conductor puede publicar un viaje (sentido, punto, hora, puestos, modo de admisión)
- [ ] El sistema sugiere una tarifa y el conductor puede modificarla
- [ ] Un pasajero puede buscar y ver viajes a <5 km y dentro de ±30 min, con la tarifa visible
- [ ] Un pasajero puede reservar (automático o por solicitud)
- [ ] Un conductor puede aceptar/rechazar solicitudes
- [ ] Al confirmarse, ambos ven el teléfono del otro y un botón que abre WhatsApp
- [ ] Ambos ven sus viajes pendientes e historial
- [ ] Los asientos disponibles bajan correctamente y un viaje lleno no acepta más reservas
- [ ] La sesión persiste al cerrar y reabrir la app

## Riesgos

| Riesgo | Mitigación |
|---|---|
| **~24 horas para 7 issues encadenados.** #1 bloquea absolutamente todo, así que cualquier retraso ahí consume el día entero | Cerrar #1 con lo mínimo (schema + sesión funcionando), sin pulir. Aplicar el plan de contingencia en cuanto se vea el retraso, no al final |
| La calificación bidireccional está en el alcance del plan (sección 3.6) pero **no tiene issue ni criterio de aceptación** | Decidir explícitamente si entra en esta fase o se difiere; hoy nadie la está construyendo |
| Sesión de Better Auth en Expo (cookies vs bearer token) | Resolverlo como primera tarea de #5, antes de cualquier pantalla |
| El tipo de `user.id` que genera Better Auth (suele ser `text`, no `uuid`) rompe las FK de `viaje`/`reserva` | Definir las FK **después** de generar las tablas de auth, copiando el tipo real |
| Sobreventa de asientos por reservas concurrentes | Decremento atómico obligatorio; probarlo con reservas simultáneas |
| Ningún paquete del monorepo tiene runner de tests | Introducirlo con el primer módulo que tenga lógica pura (motor de tarifa en #3, reglas de reserva en #4) |
| Sin comisión atractiva, ningún conductor publica | Validar el monto de la comisión con estudiantes reales durante la prueba, no en el escritorio |
