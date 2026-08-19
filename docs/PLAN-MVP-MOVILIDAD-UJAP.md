# Plan Completo — MVP Plataforma de Movilidad Universitaria (UJAP)

> Carpooling universitario tipo BlaBlaCar Daily, adaptado a la UJAP.
> Un conductor que ya va a la universidad comparte su viaje con estudiantes de zonas cercanas, reparte gastos y recibe una ganancia por el servicio.

---

## 1. Resumen del concepto

Plataforma móvil donde estudiantes que van a la UJAP en carro ofrecen los puestos libres a otros estudiantes que viven cerca de su ruta y van a la misma hora. No es taxi (ride-hailing) ni carpooling puro: es un modelo intermedio donde el conductor **reparte los gastos de gasolina Y recibe una comisión** por el servicio de recogerlos.

**Diferenciador frente a apps genéricas (Uber/Yummy):** contexto universitario cerrado, punto de destino fijo (UJAP), y —en fases futuras— matching por horario de clases. El diferenciador de fondo es que la app conoce el contexto académico, algo que ninguna app general puede aprovechar.

**Modelo de referencia validado:** BlaBlaCar Daily / BlaBlaLines (la versión de BlaBlaCar para trayectos cortos y recurrentes).

---

## 2. Objetivo del MVP

Construir y probar con estudiantes reales el flujo completo de punta a punta:

**Publicar → Buscar → Reservar → Contactar (WhatsApp) → Calificar**

Sin ninguna de las piezas pesadas (matching por horario, tracking en vivo, pagos in-app). El objetivo es validar que el concepto funciona y que la gente lo usa, no construir el producto final.

**Contexto de entrega:**
- Propósito: materia + prueba con estudiantes reales
- Plataforma: móvil (React Native)

---

## 3. Alcance del MVP

### 3.1 Cuenta y perfil
- Registro: correo (cualquiera, no institucional por ahora), contraseña, nombre, apellido, **teléfono**
- Login
- Perfil editable: nombre, apellido, foto, correo, teléfono

### 3.2 Publicar viaje (rol conductor)
- Sentido: **ida** (mi zona → UJAP) o **vuelta** (UJAP → mi zona)
- Punto de partida/llegada (su zona): dirección + coordenadas
- Hora
- Número de puestos ofrecidos
- Modo de admisión: **automático** (el pasajero se inscribe y queda) o **por solicitud** (el conductor aprueba)
- Tarifa por pasajero: el sistema **sugiere**, el conductor puede **modificarla**

### 3.3 Buscar viaje (rol pasajero)
- Sentido + su punto + hora
- Resultado: viajes de conductores a **menos de 5 km** de su punto, dentro de la **tolerancia horaria fija** (±30 min sugerido), con **tarifa visible**
- Reservar:
  - Si el viaje es automático → queda inscrito
  - Si es por solicitud → envía solicitud y espera aprobación

### 3.4 Match confirmado
- Al confirmarse (inscripción automática o solicitud aceptada) se revelan los **teléfonos de forma bidireccional**
- Botón que abre **WhatsApp** vía deep link (`https://wa.me/58XXXXXXXXXX`) para coordinar punto exacto y detalles

### 3.5 Mis viajes
- Pendientes/próximos (publicados por mí como conductor + reservados por mí como pasajero)
- Historial (viajes pasados)

### 3.6 Calificación
- Rating bidireccional conductor ↔ pasajero al completar el viaje

---

## 4. Fuera del MVP (fases futuras)

| Funcionalidad | Fase |
|---|---|
| Matching por horario de clases (el diferenciador) | 2 |
| Viaje ida + vuelta pre-armado desde el horario | 2 |
| Tracking en vivo del conductor (mapa en tiempo real) | 2 |
| Viajes recurrentes automáticos | 2 |
| Modelo de "líneas" por zona (tipo parada de bus) | 3 |
| Chat interno (en el MVP se usa WhatsApp) | 3 |
| Pago in-app / billetera | 3 |
| Compartir viaje en vivo con contacto (seguridad nocturna) | 2 |
| Matching automático óptimo multi-pasajero (optimización de rutas) | 3 |
| Verificación con correo institucional | 2 |
| Botón de pánico | 2 |

---

## 5. Motor de cálculo de tarifa

### 5.1 Datos base
- Gasolina: **$0.5 por litro**
- Rendimiento promedio asumido: **~10 km/litro** (sedán en ciudad, configurable)
- Costo de combustible ≈ **$0.05 por km**

### 5.2 Fórmulas

```
costo_combustible = distancia_km × 0.05

tarifa_sugerida_por_pasajero = (costo_combustible / puestos_ofrecidos) + comision_sugerida
```

- El sistema calcula `costo_combustible` a partir de la distancia entre el punto del conductor y la UJAP (coordenada fija).
- El sistema sugiere la tarifa; **el conductor puede modificarla**.
- La tarifa es **por pasajero** y queda fija en el viaje.
- Recomendado: mostrar un tope suave ("por encima de X ya deja de ser compartir gastos") sin bloquear en el MVP.

### 5.3 Ejemplo (Trigal → UJAP, ~8 km, 2 pasajeros)
- Combustible = 8 × 0.05 = **$0.40**
- Con comisión sugerida de $0.50/pasajero:
  - Cada pasajero paga: (0.40 / 2) + 0.50 = **$0.70**
  - El conductor recibe 2 × 0.70 = $1.40, gastó $0.40 → **gana ~$1.00**

### 5.4 Nota clave de diseño
Los montos de combustible son diminutos ($0.40 por viaje). Por eso **la comisión, no el combustible, es lo que hace atractivo manejar.** La comisión debe ser generosa respecto al combustible o ningún conductor se molestará en desviarse. (Este es el mismo problema que BlaBlaCar identificó para trayectos cortos: sin incentivo fuerte, la gente no comparte el carro.)

### 5.5 Cálculo de distancia
- **Opción de arranque (sin dependencias externas):** Haversine (distancia en línea recta) × factor de corrección ~1.3 para aproximar distancia por carretera.
- **Opción con API de rutas:** distancia real por carretera (Google Maps / Mapbox / OSRM). Recomendado migrar a esto si el tiempo lo permite.
- La UJAP es punto fijo → su coordenada va hardcodeada, solo se geocodifica el punto del estudiante.

---

## 6. Modelo de datos

### Usuario
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| nombre | string | |
| apellido | string | |
| correo | string | único |
| password_hash | string | |
| telefono | string | formato internacional para wa.me |
| foto | string (URL) | opcional |

### Viaje
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| conductor_id | UUID | FK → Usuario |
| sentido | enum | `ida` / `vuelta` |
| punto_lat | float | coordenada del extremo variable (zona) |
| punto_lng | float | |
| punto_texto | string | dirección legible |
| hora | timestamp | |
| asientos_totales | int | |
| asientos_disponibles | int | baja con cada reserva |
| modo_admision | enum | `auto` / `solicitud` |
| tarifa_por_pasajero | decimal | sugerida por sistema, editable |
| estado | enum | `activo` / `completado` / `cancelado` |

### Reserva
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| viaje_id | UUID | FK → Viaje |
| pasajero_id | UUID | FK → Usuario |
| estado | enum | `inscrita` / `solicitada` / `aceptada` / `rechazada` |
| fecha | timestamp | |


> **UJAP como punto fijo:** todos los viajes tienen la UJAP en un extremo, así que solo se almacena el punto variable (la zona del estudiante). El matching compara únicamente ese extremo.

---

## 7. Lógica de matching (MVP)

Cuando un pasajero busca:

1. Filtra viajes con el **mismo sentido** (ida/vuelta)
2. Filtra por **hora dentro de la tolerancia** (hora buscada ± 30 min)
3. Filtra por **cercanía punto-a-punto**: distancia entre el punto del pasajero y el punto del conductor **< 5 km**
4. Filtra viajes con **asientos disponibles > 0**
5. Ordena por cercanía (o por hora)

**Consulta geoespacial:** con PostGIS, `ST_DWithin` resuelve el filtro de 5 km de forma directa y eficiente. No se calcula cercanía a la ruta (eso es fase 2), solo punto-a-punto.

---

## 8. Flujos de usuario

### Flujo conductor
1. Se registra / inicia sesión
2. "Publicar viaje" → elige sentido, marca su punto en el mapa, pone hora y puestos
3. Elige modo de admisión (auto / solicitud)
4. El sistema sugiere tarifa; la ajusta si quiere
5. Publica → el viaje queda activo
6. (Si es por solicitud) recibe solicitudes y las acepta/rechaza
7. Al confirmarse, ve el teléfono del pasajero + botón WhatsApp
8. Tras el viaje, califica

### Flujo pasajero
1. Se registra / inicia sesión
2. "Buscar viaje" → elige sentido, marca su punto, pone hora
3. Ve lista de viajes compatibles (<5 km, ±30 min) con tarifa
4. Reserva (queda inscrito o envía solicitud)
5. Al confirmarse, ve el teléfono del conductor + botón WhatsApp
6. Coordina por WhatsApp
7. Tras el viaje, califica

---

## 9. Stack técnico

| Capa | Tecnología |
|---|---|
| App móvil | React Native (Expo) |
| Backend | Node.js + fastify |
| Base de datos | PostgreSQL |
| ORM | Drizzle |
| Mapas/geocoding | Google Maps API o Mapbox (o Haversine local para arrancar) |
| Contacto | Deep link a WhatsApp (`wa.me`) |

---

## 10. Criterios de aceptación del MVP

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


---

*Documento de planificación — MVP movilidad universitaria UJAP.*
