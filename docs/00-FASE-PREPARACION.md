# Fase 0 — Preparación

**Estado:** ✅ completada (13 – 18 de agosto de 2026)
**Objetivo:** llegar desde un template Vue standalone hasta un monorepo funcional, con un prototipo navegable entregado al cliente y el concepto de producto definido.

> Esta fase agrupa los tres bloques de trabajo previos al MVP —setup del monorepo, prototipo de demostración y análisis de producto—. Se documenta aquí como **historia del proyecto**: qué se planificó, qué aterrizó realmente y en qué se desvió. El desarrollo del producto arranca en la [Fase 1 — MVP de Movilidad](./01-FASE-MVP.md).

---

## 0.1 Setup del monorepo

**Entregable:** monorepo funcional con `apps/mobile`, `apps/api` y paquetes compartidos.

Se migró el template Vue 3 + Vite original a un monorepo con Turborepo + PNPM workspaces. El template Vue no se portó como código (el stack destino es React Native); su valor fue servir de referencia de diseño y de flujo de UX.

### Qué aterrizó

```
apps/
  api/       Fastify + Drizzle + PostgreSQL
  mobile/    Expo (React Native) + Expo Router + NativeWind
packages/
  shared/    Entidades de dominio compartidas
tooling/
  typescript/  eslint/  prettier/
```

### Desviaciones respecto a lo planificado

| Planificado | Real | Motivo |
|---|---|---|
| `apps/web-reference` con el template Vue | No existe | Los tokens de diseño se extrajeron a `apps/mobile/src/lib/tokens.ts`; conservar el proyecto Vue completo no aportaba |
| `packages/config-ts`, `packages/config-eslint` | `tooling/typescript`, `tooling/eslint`, `tooling/prettier` | Se separó configuración de código de dominio: `packages/` queda solo para paquetes del producto |
| — | NativeWind + Tailwind | Decisión de estilos no prevista en el plan original |
| — | Expo Router (file-based) | Se eligió sobre React Navigation por integración con Expo |
| — | Husky + lint-staged + Commitlint | Control de calidad en commits, añadido durante la fase |

---

## 0.2 Prototipo de demostración

**Entregable:** build navegable presentable al cliente.

### Qué aterrizó

- Pantalla de inicio ("¿A dónde vas hoy?") con input de destino y botón de búsqueda.
- Navegación por 4 tabs: Inicio, Viajes, Historial, Perfil (los tres últimos como placeholders).
- Placeholder visual de mapa (`MapPlaceholder`).
- Sistema de componentes propio: `Button`, `Input`, `Card`, `Checkbox`, `Toggle`, `Text`, `BottomNavbar`, `ViajeCard`.
- Backend real de punta a punta: tabla `viajes` de demo en PostgreSQL vía Drizzle, seed con destinos del área de la UJAP, y `GET /viajes?destino=` en Fastify consumido por la app.

### Qué de esto sobrevive al MVP

El **sistema de componentes y los tokens de diseño sí** — son la base visual de las pantallas de la Fase 1.

El **modelo de datos del prototipo no**. La tabla `viajes` de demo (`origen`, `destino`, `hora`, `cupos_disponibles`, `precio_bs`, `precio_usd`), el tipo `Viaje` en `packages/shared` y el endpoint `GET /viajes?destino=` describen un producto distinto al que define el MVP, y los reemplazan los módulos de la Fase 1.

---

## 0.3 Análisis y definición de producto

**Entregable planificado:** documento de análisis con benchmark de Ridery y Yummy Rides, consideraciones del contexto venezolano y requerimientos priorizados.

**Entregable real:** el [Plan MVP de Movilidad Universitaria](./PLAN-MVP-MOVILIDAD-UJAP.md), que define el producto por una vía distinta: en lugar de partir de un benchmark de ride-hailing local, adopta como modelo de referencia **BlaBlaCar Daily** y fija un concepto concreto —carpooling universitario con destino fijo (UJAP), reparto de gastos más comisión para el conductor—.

### Preguntas que el plan cerró

| Pregunta abierta | Respuesta |
|---|---|
| ¿Qué es RideUJAP exactamente? | Carpooling universitario, no ride-hailing. Punto de destino fijo: la UJAP |
| ¿Ride-hailing o carpooling puro? | Modelo intermedio: el conductor reparte gastos **y** cobra una comisión |
| ¿Pagos dentro de la app? | No. Se coordinan fuera de la app; el contacto se hace por WhatsApp |
| ¿Chat interno? | No en el MVP. WhatsApp vía deep link `wa.me` |
| ¿Correo institucional obligatorio? | No en el MVP. La verificación institucional pasa a la [Fase 2](./02-FASE-HORARIOS.md) |
| ¿Cómo se calcula la tarifa? | Motor propio: combustible por km + comisión sugerida, editable por el conductor |
| ¿Hace falta una librería de mapas para el matching? | No. Haversine local resuelve el filtro de cercanía |

### Preguntas que siguen abiertas

Se arrastran como decisiones pendientes de la [Fase 1](./01-FASE-MVP.md):

- **Visualización de precios en Bs con tasa del [BCV](https://www.bcv.org.ve).** El plan MVP calcula todo en USD y no menciona el bolívar. Mostrar precios en Bs sigue siendo un requerimiento razonable para usuarios venezolanos, pero hoy no está cubierto por ningún módulo.
- **Plataforma de deploy:** Railway vs Render.
- **Librería de mapas** para el selector de punto (ya no bloquea el matching, pero sí mejora la UX de publicar/buscar).
- **Benchmark formal de [Ridery](https://web.ridery.app) y [Yummy Rides](https://www.yummysuperapp.com/rides)**, nunca realizado. Los usuarios llegan con las expectativas de UX que esas apps instalaron.
- **Entrevistas con estudiantes UJAP**, nunca realizadas. Previstas como validación durante la prueba del MVP.
