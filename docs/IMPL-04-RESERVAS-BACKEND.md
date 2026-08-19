# Plan de implementación — Issue #4: Módulo Reservas (Backend)

> **Issue:** [#4 — [Backend] Módulo Reservas — reservar + admisión + contacto + mis viajes](https://github.com/Abisaac1809/RideUjap/issues/4)
> **Depende de:** #1 (cerrado — schema y sesión ya en `main`)
> **Desbloquea:** #7 (Frontend Reservas)
> **Rama sugerida:** `feat/reservas-reservar-admision-contacto`

---

## 1. Punto de partida

Lo que ya existe en `main` y este módulo reutiliza sin tocar:

- `apps/api/src/db/schema.ts` — tablas `trips` y `reservations` con los enums `admission_mode` (`auto` / `request`), `trip_status` (`active` / `completed` / `cancelled`) y `reservation_status` (`enrolled` / `requested` / `accepted` / `rejected`).
- `apps/api/src/auth/require-auth.ts` — `requireAuth` ya escrito pero **todavía sin usar en ninguna ruta**; este módulo es el primero que lo consume.
- `apps/api/src/server.ts` — `GET /trips` con su `toDto()` y el patrón de schemas de Fastify a imitar.
- `packages/shared/src/trip.ts` — tipo `Trip`, ya compartido entre API y móvil.

Lo que **no** existe todavía y este módulo no espera:

- `POST /trips` (issue #3, rama `feat/viajes-publicar-buscar-tarifa`). No es bloqueante: la tabla `trips` ya está creada y el seed genera viajes de prueba. Se trabaja contra los datos del seed.
- Runner de tests en cualquier paquete del monorepo. Este módulo lo introduce (ver §7).

---

## 2. Decisiones de diseño

| Decisión                                   | Resolución                                                                                                           | Por qué                                                                                                                                                                                                                                                                                           |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Idioma de las rutas**                    | Inglés: `POST /trips/:id/reservations`, `PATCH /reservations/:id`, `GET /reservations/:id/contact`, `GET /my-trips`  | El issue las nombra en español (`/viajes/:id/reservar`), pero el código ya expone `GET /trips` y los tipos compartidos son `Trip`/`SearchTripsQuery`. Mezclar idiomas en la superficie HTTP es peor que desviarse del texto del issue. **Confirmar con el autor del issue antes de abrir el PR.** |
| **Ubicación del decremento**               | Modo `auto`: al crear la reserva. Modo `request`: al aceptar                                                         | Es lo que define el enum: `enrolled` ya ocupa puesto, `requested` no.                                                                                                                                                                                                                             |
| **Atomicidad**                             | `UPDATE ... WHERE available_seats > 0 RETURNING` dentro de una transacción, nunca `SELECT` + `UPDATE`                | Un `SELECT` previo abre ventana de sobreventa entre lectura y escritura. El update condicional deja que Postgres serialice el conflicto.                                                                                                                                                          |
| **Doble reserva**                          | Índice único parcial en `(trip_id, passenger_id)` que excluye `rejected`                                             | Garantía a nivel de base de datos, no solo de aplicación: dos requests simultáneos no pueden colarse. Excluir `rejected` deja al pasajero volver a solicitar después de un rechazo.                                                                                                               |
| **Revelado de teléfono**                   | Una sola función pura (`canRevealPhone`) usada por el endpoint de contacto **y** por la serialización de `/my-trips` | Una única definición de "confirmada" evita que una pantalla filtre lo que la otra oculta.                                                                                                                                                                                                         |
| **Solicitudes del conductor**              | Van embebidas en los items de `/my-trips` con `role: "driver"`, sin endpoint aparte                                  | #7 necesita ver las solicitudes en la misma pantalla de "mis viajes"; un `GET /trips/:id/reservations` extra sería una llamada más para la misma información.                                                                                                                                     |
| **Viaje pasado sin cerrar**                | Cuenta como historial si `departure_time < now()`, aunque siga `active`                                              | Nada marca los viajes como `completed` en el MVP (no hay job ni cron). Sin este predicado, "próximos" acumula viajes viejos para siempre.                                                                                                                                                         |
| **Reservar viaje lleno en modo `request`** | Se rechaza igual que en modo `auto` (409)                                                                            | Acumular solicitudes que el conductor nunca podrá aceptar es ruido para ambos lados.                                                                                                                                                                                                              |

---

## 3. Cambios de schema y migración

En `apps/api/src/db/schema.ts`, añadir el tercer argumento de `pgTable` a `reservations`:

```ts
export const reservations = pgTable(
  "reservations",
  {/* columnas actuales, sin cambios */},
  (table) => [
    // Un pasajero no puede tener dos reservas vivas sobre el mismo viaje.
    // Se excluye `rejected` para permitir volver a solicitar tras un rechazo.
    uniqueIndex("reservations_trip_passenger_active_uidx")
      .on(table.tripId, table.passengerId)
      .where(sql`${table.status} <> 'rejected'`),
    index("reservations_passenger_idx").on(table.passengerId),
    index("reservations_trip_idx").on(table.tripId),
  ],
);
```

Y en `trips`, un índice para el lado conductor de `/my-trips`:

```ts
(table) => [index("trips_driver_idx").on(table.driverId)];
```

Después:

```bash
pnpm -F @rideujap/api db:generate    # genera 0001_*.sql
pnpm -F @rideujap/api db:migrate
```

> **Ojo:** el seed actual inserta dos reservas de Carla en viajes distintos, así que el índice aplica limpio. Si la base local tiene datos manuales duplicados, la migración falla — limpiar con `db:seed` antes.

---

## 4. Contratos de API

Todas las rutas van detrás de `preHandler: requireAuth` y responden `401 { "error": "Unauthorized" }` sin sesión. El cuerpo de error mantiene la forma ya usada en `server.ts`: `{ "error": string }`.

### 4.1 `POST /trips/:id/reservations`

Reserva del pasajero autenticado. Sin body.

**201**

```json
{
  "id": "uuid",
  "tripId": "uuid",
  "status": "enrolled",
  "createdAt": "2026-08-19T10:00:00.000Z",
  "availableSeats": 2,
  "contactPhone": "+584141234567"
}
```

`status` es `enrolled` si el viaje es `auto`, `requested` si es `request`. `contactPhone` trae el teléfono del **conductor** solo cuando la reserva queda confirmada de una (modo `auto`); en modo `request` va `null`.

| Situación                     | Código | `error`                               |
| ----------------------------- | ------ | ------------------------------------- |
| Viaje inexistente             | 404    | `Viaje no encontrado`                 |
| El pasajero es el conductor   | 403    | `No puedes reservar tu propio viaje`  |
| Viaje no `active` o ya partió | 409    | `El viaje ya no acepta reservas`      |
| Ya tiene una reserva viva     | 409    | `Ya tienes una reserva en este viaje` |
| Sin asientos                  | 409    | `El viaje está lleno`                 |

### 4.2 `PATCH /reservations/:id`

Solo el conductor del viaje. Body: `{ "status": "accepted" | "rejected" }`.

**200**

```json
{
  "id": "uuid",
  "tripId": "uuid",
  "status": "accepted",
  "createdAt": "2026-08-19T10:00:00.000Z",
  "availableSeats": 1,
  "contactPhone": "+584249876543"
}
```

`contactPhone` es el teléfono del **pasajero** al aceptar; `null` al rechazar.

| Situación                         | Código | `error`                              |
| --------------------------------- | ------ | ------------------------------------ |
| Reserva inexistente               | 404    | `Reserva no encontrada`              |
| Quien llama no es el conductor    | 403    | `No eres el conductor de este viaje` |
| La reserva no está en `requested` | 409    | `La reserva ya fue gestionada`       |
| Aceptar con el viaje lleno        | 409    | `El viaje está lleno`                |
| Aceptar en un viaje no `active`   | 409    | `El viaje ya no acepta reservas`     |

### 4.3 `GET /reservations/:id/contact`

Bidireccional: lo puede llamar el conductor del viaje o el pasajero de la reserva.

**200**

```json
{
  "reservationId": "uuid",
  "status": "enrolled",
  "counterpart": {
    "id": "user-id",
    "name": "Ana González",
    "image": null,
    "phone": "+584141234567"
  }
}
```

`counterpart.phone` es `null` mientras la reserva no esté `enrolled` o `accepted` — el resto de los datos sí se devuelven, para que #7 pueda pintar la tarjeta sin el botón de WhatsApp. Quien no participa en la reserva recibe **403** (`No tienes acceso a esta reserva`), no 404 con el teléfono adentro.

### 4.4 `GET /my-trips`

**200**

```json
{
  "upcoming": [
    {
      "role": "driver",
      "trip": { "...": "Trip completo, mismo DTO que GET /trips" },
      "reservations": [
        {
          "id": "uuid",
          "status": "requested",
          "createdAt": "2026-08-19T10:00:00.000Z",
          "passenger": { "id": "...", "name": "Carla Rodríguez", "image": null, "phone": null }
        }
      ]
    },
    {
      "role": "passenger",
      "trip": { "...": "Trip completo" },
      "reservation": { "id": "uuid", "status": "enrolled", "createdAt": "..." },
      "driverPhone": "+584141234567"
    }
  ],
  "history": []
}
```

- `upcoming`: viaje `active` **y** `departure_time >= now()`. Ordenado por `departureTime` ascendente.
- `history`: viaje `completed`/`cancelled`, o `departure_time < now()`. Ordenado descendente. Las reservas `rejected` del pasajero también caen aquí, independientemente de la fecha.
- El `phone` de cada pasajero y el `driverPhone` salen de la misma función `canRevealPhone`: `null` mientras la reserva no esté confirmada.

---

## 5. Archivos

**Nuevos**

| Archivo                                   | Contenido                                                                                                   |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `apps/api/src/reservations/rules.ts`      | Lógica pura: `canReserve`, `canDecide`, `canRevealPhone`, `classifyMyTrip`. Sin imports de `db`.            |
| `apps/api/src/reservations/rules.test.ts` | Tests unitarios de lo anterior (§7).                                                                        |
| `apps/api/src/reservations/routes.ts`     | Plugin de Fastify con 4.1, 4.2 y 4.3.                                                                       |
| `apps/api/src/reservations/schemas.ts`    | JSON schemas de params/body/response de ese plugin.                                                         |
| `apps/api/src/my-trips/routes.ts`         | Plugin de Fastify con 4.4 y sus dos queries.                                                                |
| `apps/api/src/my-trips/schemas.ts`        | JSON schema de la respuesta de `/my-trips`.                                                                 |
| `apps/api/src/trips/dto.ts`               | `TripRow` + `toDto` + la lista de columnas del select y el JSON schema del viaje, extraídos de `server.ts`. |
| `apps/api/src/db/errors.ts`               | `isUniqueViolation`: detecta el `23505` de Postgres aunque venga envuelto (ver §6).                         |
| `apps/api/src/db/errors.test.ts`          | Tests de lo anterior.                                                                                       |

**Modificados**

| Archivo                                                   | Cambio                                                                                                                                                                                                               |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/src/server.ts`                                  | Registrar los dos plugins; importar `toDto` desde su nuevo módulo en vez de definirlo inline.                                                                                                                        |
| `apps/api/src/db/schema.ts`                               | Índices de §3.                                                                                                                                                                                                       |
| `apps/api/src/db/migrations/0001_*.sql`                   | Generada por `db:generate`.                                                                                                                                                                                          |
| `packages/shared/src/reservation.ts` (nuevo) + `index.ts` | Tipos `Reservation`, `ReservationStatus`, `ReservationResponse`, `ContactResponse`, `MyTripItem`, `MyTripsResponse`.                                                                                                 |
| `apps/api/package.json`                                   | `vitest` en devDependencies + script `"test": "vitest run"`.                                                                                                                                                         |
| `turbo.json`                                              | Tarea `test` (`{ "dependsOn": ["^build"] }`).                                                                                                                                                                        |
| `package.json` (raíz)                                     | Script `"test": "turbo run test"`.                                                                                                                                                                                   |
| `apps/api/src/db/seed.ts`                                 | Escenarios de QA: viaje lleno, viaje de un solo puesto, viaje pasado, reserva `rejected`, y un cuarto usuario (Diego) sin reservas — es el que puede probar los casos de rechazo sin ensuciar el resto de los datos. |

> **Riesgo de conflicto:** extraer `toDto` toca `server.ts`, archivo que la rama de #3 también va a modificar. Es un corte-y-pega sin cambio de comportamiento; conviene avisar en el issue #3 antes de hacerlo, o dejarlo como primer commit aislado para que el rebase sea trivial.

---

## 6. Implementación de la parte delicada

Reservar en modo `auto` — decremento y creación en una sola transacción:

```ts
const created = await db.transaction(async (tx) => {
  const [updated] = await tx
    .update(trips)
    .set({ availableSeats: sql`${trips.availableSeats} - 1` })
    .where(and(eq(trips.id, tripId), eq(trips.status, "active"), gt(trips.availableSeats, 0)))
    .returning({ availableSeats: trips.availableSeats });

  if (!updated) return null; // lleno o ya no activo: la transacción no escribió nada

  const [reservation] = await tx
    .insert(reservations)
    .values({ tripId, passengerId, status: "enrolled" })
    .returning();

  return { reservation, availableSeats: updated.availableSeats };
});
```

Si el índice único dispara (dos requests simultáneos del mismo pasajero), `postgres` lanza un error con `code === "23505"`: capturarlo alrededor de la transacción y devolver el 409 de doble reserva. La transacción hace rollback del decremento sola.

> **Ojo con el error envuelto:** Drizzle no propaga el error del driver tal cual, lo mete en un `DrizzleQueryError` y deja el original en `cause`. Mirar solo `err.code` no encuentra el `23505` y la doble reserva simultánea termina en un 500 — pasó en la primera pasada. `isUniqueViolation` recorre la cadena de `cause`.

Aceptar una solicitud usa la misma forma, con el update de la reserva condicionado al estado de origen para que dos `PATCH` simultáneos no descuenten dos asientos:

```ts
.update(reservations)
.set({ status: "accepted" })
.where(and(eq(reservations.id, id), eq(reservations.status, "requested")))
.returning()
```

Si ese update no devuelve fila, la reserva ya fue gestionada → 409 y rollback.

---

## 7. Tests

Este módulo introduce **Vitest** en `apps/api` (el riesgo "ningún paquete tiene runner de tests" de [01-FASE-MVP](./01-FASE-MVP.md) se cierra aquí, ya que #3 aún no lo hizo). Solo tests unitarios sobre `rules.ts` — sin base de datos, sin levantar el servidor.

Casos a cubrir:

- `canReserve`: viaje `auto` con asientos → `enrolled`; viaje `request` con asientos → `requested`; asientos en 0 → `full`; viaje `cancelled`/`completed` → `closed`; `departureTime` pasada → `closed`; pasajero == conductor → `own_trip`; reserva viva existente → `duplicate`; reserva previa `rejected` → permite reservar de nuevo.
- `canDecide`: no conductor → `forbidden`; reserva `enrolled` → `already_handled`; reserva `accepted`/`rejected` → `already_handled`; aceptar con 0 asientos → `full`; rechazar con 0 asientos → permitido (rechazar no consume puestos).
- `canRevealPhone`: `enrolled` y `accepted` → `true`; `requested` y `rejected` → `false`.
- `classifyMyTrip`: `active` + futuro → `upcoming`; `active` + pasado → `history`; `completed`/`cancelled` → `history`; reserva `rejected` → `history` aunque el viaje sea futuro.

El decremento atómico no se cubre con estos tests — queda verificado a mano en §9.

---

## 8. Orden de trabajo

1. Extraer `toDto` a `apps/api/src/trips/dto.ts` y dejar `server.ts` compilando igual. Commit aislado.
2. Índices en `schema.ts` + `db:generate` + `db:migrate`.
3. Tipos en `packages/shared`.
4. `rules.ts` con la lógica pura.
5. Vitest + `rules.test.ts` en verde. _(1–4 y 5 son la parte que se puede escribir sin base de datos)_
6. `reservations/routes.ts`: `POST` primero — es el punto de corte del módulo según el plan de fase ("se crea la reserva y el asiento baja de forma atómica"). Con esto ya se desbloquea #7.
7. `PATCH` + `GET /reservations/:id/contact`.
8. `GET /my-trips`.
9. Seed con los escenarios de QA.
10. `pnpm lint && pnpm type-check && pnpm test` en verde.

---

## 9. Verificación manual

Con `docker compose up -d`, `db:migrate`, `db:seed` y `pnpm -F @rideujap/api dev`. Las cuentas del seed usan la contraseña `password123`.

1. **Sin sesión** → `POST /trips/<id>/reservations` responde 401.
2. **Reserva automática** — con Carla, sobre el viaje `auto` de Bruno: responde 201 con `status: "enrolled"`, `availableSeats` baja de 2 a 1 y `contactPhone` trae el teléfono de Bruno.
3. **Doble reserva** — repetir el paso anterior: 409 y `availableSeats` **sigue en 1**.
4. **Viaje lleno** — reservar hasta agotar los puestos; la siguiente responde 409 y `available_seats` nunca queda negativo en la base.
5. **Reservar el propio viaje** — con Ana, sobre un viaje de Ana: 403.
6. **Solicitud** — con Carla, sobre el viaje `request` de Ana: 201 con `status: "requested"`, `availableSeats` **no cambia**, `contactPhone` es `null`.
7. **Teléfono oculto** — `GET /reservations/<id>/contact` sobre esa solicitud: 200 con `counterpart.phone: null`.
8. **Aceptar** — con Ana, `PATCH /reservations/<id>` con `{"status":"accepted"}`: 200, `availableSeats` baja en 1, y ahora el contacto devuelve el teléfono **para los dos lados** (llamarlo con la sesión de Ana y con la de Carla).
9. **Re-gestionar** — repetir el `PATCH`: 409.
10. **Ajeno** — con Bruno, `PATCH` sobre una reserva de un viaje de Ana: 403; y `GET .../contact` sobre esa misma reserva: 403.
11. **`GET /my-trips` como Ana**: sus viajes publicados en `upcoming` con la lista de solicitudes embebida.
12. **`GET /my-trips` como Carla**: sus reservas en `upcoming`, con `driverPhone` presente solo en las confirmadas; la reserva `rejected` del seed aparece en `history`.
13. **Concurrencia** — sobre un viaje con 1 puesto, dos reservas simultáneas de pasajeros distintos:
    ```bash
    curl -X POST .../reservations -H "Cookie: <sesión A>" &
    curl -X POST .../reservations -H "Cookie: <sesión B>" &
    ```
    Exactamente una responde 201, la otra 409, y `available_seats` queda en 0.

---

## 10. Fuera de alcance

- Cancelar una reserva ya hecha (el enum no tiene estado para eso) y devolver el asiento.
- Marcar viajes como `completed` — no hay job; §2 lo compensa con el predicado de fecha.
- Notificaciones al conductor cuando entra una solicitud.
- Calificación bidireccional (sin issue asignado en la fase).
- Tests de integración contra Postgres: el paso 13 de §9 los sustituye a mano; montar la infraestructura de base de datos de test no cabe en el deadline.
