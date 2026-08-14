# Fase 3 — Análisis y requerimientos iniciales

**Deadline: no definido** (propuesto: semana del 20 al 26 de agosto, arrancando justo después de la entrega del MVP)
**Objetivo:** producir el documento de análisis de producto y requerimientos que servirá de base para extender el roadmap (Fase 4).

---

## Entregable

Un documento único (`ANALISIS-Y-REQUERIMIENTOS.md` o formato que prefiera el cliente) con las secciones descritas abajo, revisado y aprobado por el cliente.

---

## Secciones del documento

### 1. Definición del producto y usuarios

- ¿Qué es RideUJAP? Propuesta de valor en una frase (hipótesis actual: *viajes compartidos entre miembros de la comunidad UJAP*).
- Perfiles de usuario: estudiantes, profesores, personal administrativo. Diferencias entre conductor (ofrece cupos) y pasajero.
- Contexto físico: campus de la UJAP en Municipio San Diego, Valencia, estado Carabobo — rutas típicas de la comunidad (consultar [ujap.edu.ve](https://ujap.edu.ve) para sedes y horarios académicos que condicionan los picos de demanda).
- Preguntas abiertas para el cliente: ¿solo comunidad UJAP (validación con correo institucional)? ¿viajes recurrentes tipo "todos los lunes 7am" o puntuales?

### 2. Benchmark del mercado venezolano

Análisis comparativo con los dos referentes locales:

| Aspecto a estudiar | [Ridery](https://web.ridery.app) | [Yummy Rides](https://www.yummysuperapp.com/rides) |
|---|---|---|
| Modelo (ride-hailing profesional vs carpooling) | | |
| Esquema de precios y monedas aceptadas | | |
| Métodos de pago (Pago Móvil, Zelle, efectivo USD, tarjeta) | | |
| Onboarding y verificación de conductores | | |
| Cobertura en Valencia/Carabobo | | |

**Pregunta estratégica central:** RideUJAP no compite en el mismo espacio (es carpooling comunitario, no ride-hailing comercial), pero los usuarios llegarán con las expectativas de UX que estas apps ya instalaron. El benchmark debe identificar qué patrones conviene adoptar y de cuáles diferenciarse.

### 3. Consideraciones del contexto venezolano

Esta sección es crítica y debe resolverse con el cliente antes de la Fase 4:

- **Moneda y tarifas:** los precios se muestran típicamente en Bs con referencia en USD. Definir:
  - Si la app consumirá la tasa oficial del **[BCV](https://www.bcv.org.ve)** de forma automatizada (evaluar cómo obtenerla: la web del BCV publica la tasa diaria; investigar si existe un mecanismo estable de consulta o si se ingresará manualmente).
  - Frecuencia de actualización (la tasa cambia a diario en jornada bancaria).
  - Redondeos y visualización (ej. "Bs 350,00 (~2,50 USD)").
- **Pagos:** en el MVP probablemente los pagos sean *fuera de la app* (acuerdo entre usuarios: Pago Móvil, efectivo). Documentar si el cliente aspira a pagos integrados a futuro y qué implicaría.
- **Conectividad:** datos móviles intermitentes son la norma. Requisitos derivados: estados de carga claros, reintentos, y evaluar qué funciona sin conexión.
- **Dispositivos:** predominio de Android de gama media/baja → presupuesto de rendimiento y peso de la app.

### 4. Requerimientos funcionales priorizados

Redactar como historias de usuario priorizadas (MoSCoW o similar). Semilla inicial a validar:

- **Must:** registro/login (¿correo @ujap?), publicar viaje (conductor), buscar y solicitar cupo (pasajero), ver mis viajes, perfil básico.
- **Should:** mapa con origen/destino, notificaciones, calificaciones entre usuarios.
- **Could:** viajes recurrentes, chat interno, estimación de tarifa con tasa BCV.
- **Won't (por ahora):** pagos dentro de la app, tracking en tiempo real.

### 5. Requerimientos no funcionales

Seguridad (datos personales de estudiantes — considerar qué exige la universidad), rendimiento en gama baja, disponibilidad esperada del backend.

### 6. Decisiones técnicas pendientes

Con el análisis en mano, cerrar las dos decisiones abiertas del stack:

- **Librería de mapas** — usando los criterios definidos en la Fase 2 (costo en USD, cartografía de Valencia, soporte Expo).
- **Plataforma de deploy** — comparar [Railway](https://docs.railway.com) vs [Render](https://render.com/docs) en: precio del tier necesario (facturado en USD), PostgreSQL gestionado incluido, región del datacenter más cercana (latencia desde Venezuela), y experiencia de despliegue con monorepos Turborepo (ambas plataformas documentan este caso).

---

## Método de trabajo sugerido

1. **Entrevista con el cliente** tras la demo del MVP (los comentarios de la demo son insumo directo).
2. **2–3 entrevistas cortas con usuarios potenciales** (estudiantes UJAP) — media hora cada una rinde muchísimo a este nivel de madurez.
3. **Benchmark hands-on:** instalar Ridery y Yummy Rides y documentar sus flujos con capturas.
4. **Redacción y revisión** con el cliente; el documento aprobado dispara la planificación de la Fase 4.

## Criterios de aceptación

1. Documento aprobado por el cliente.
2. Las dos decisiones técnicas pendientes (mapas y deploy) tienen recomendación justificada.
3. Backlog priorizado listo para convertirse en el plan de la Fase 4.
