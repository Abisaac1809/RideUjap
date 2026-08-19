# Fase 3 — Líneas, chat y pagos

**Estado:** 🔭 horizonte de producto — no planificada en detalle
**Precondición:** volumen de usuarios suficiente para que estas piezas tengan sentido ([Fase 2](./02-FASE-HORARIOS.md) en producción).

> Esta fase corresponde a la **Fase 3** definida en la [sección 4 del plan MVP](./PLAN-MVP-MOVILIDAD-UJAP.md). Es la fase de escala: deja de tratarse de conectar dos personas y pasa a tratarse de operar un sistema.

---

## Alcance previsto

### 1. Modelo de "líneas" por zona

En lugar de puntos sueltos negociados uno a uno, zonas con paradas conocidas —el modelo tipo parada de autobús que usa BlaBlaCar para trayectos recurrentes—. Solo funciona con suficientes usuarios por zona: con pocos, una línea vacía es peor experiencia que un punto acordado por WhatsApp.

### 2. Matching automático óptimo multi-pasajero

Optimización real de rutas: qué combinación de pasajeros minimiza el desvío del conductor. El MVP ordena por cercanía punto a punto y ya; esto es un problema de optimización con su propio coste de cómputo.

### 3. Chat interno

Reemplaza el deep link a WhatsApp. Gana trazabilidad, moderación y contexto del viaje dentro de la app; pierde la fricción cero de un canal que todos ya tienen instalado. Solo vale la pena cuando haya algo que WhatsApp no pueda resolver.

### 4. Pago in-app / billetera

El MVP deja el pago fuera de la app deliberadamente. Integrarlo implica entrar en medios de pago venezolanos (Pago Móvil, transferencias, efectivo en USD), manejo de saldos y disputas — un producto en sí mismo.

---

## Por qué nada de esto está en el MVP

Estas cuatro piezas comparten un patrón: **todas mejoran algo que ya funciona a mano**. WhatsApp ya coordina, el efectivo ya paga, y el orden por cercanía ya arma un viaje razonable. Ninguna es un habilitador; todas son optimizaciones, y optimizar antes de tener volumen es trabajo perdido.

## Decisiones que habrá que tomar

- Umbral de usuarios por zona a partir del cual una línea es viable.
- Medios de pago a soportar y quién asume el riesgo de las disputas.
- Si el chat interno sustituye a WhatsApp o convive con él.
- Visualización de precios en Bs con tasa del [BCV](https://www.bcv.org.ve), si no se resolvió antes (arrastrada desde la [Fase 1](./01-FASE-MVP.md)).
