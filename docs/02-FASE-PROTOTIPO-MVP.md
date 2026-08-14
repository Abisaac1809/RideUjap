# Fase 2 — Prototipo (MVP)

**Deadline: Miércoles 19 de agosto de 2026**
**Objetivo:** primera entrega navegable al cliente. Demostrar el flujo principal de la app en React Native, conectado a un backend real (aunque mínimo), con placeholder de mapa.

> ⚠️ Solo hay ~2 días entre el cierre del setup y esta entrega. El alcance de esta fase es deliberadamente pequeño: **flujo demostrable > funcionalidad completa**. Todo lo que no aporte a la demo se difiere a la Fase 4.

---

## Alcance del MVP

### Incluye ✅

1. **Pantalla de inicio** — réplica en React Native del diseño ya validado en el template Vue:
   - Encabezado "RideUJAP / ¿A dónde vas hoy? / Comparte el viaje con tu comunidad universitaria".
   - Input de destino + botón "Buscar viaje".
   - Navbar inferior con 4 tabs: Inicio, Viajes, Historial, Perfil.
2. **Navegación entre tabs** — las pantallas Viajes/Historial/Perfil pueden ser placeholders con contenido estático.
3. **Placeholder de mapa** — un contenedor visual donde vivirá el mapa (`[LIBRERÍA DE MAPAS POR DEFINIR]`), con una imagen estática o un recuadro identificado como "Mapa".
4. **Una llamada real al API** — al buscar un viaje, la app consulta un endpoint de Fastify que devuelve viajes de ejemplo (datos semilla en PostgreSQL vía Drizzle). Esto demuestra que la arquitectura completa funciona de punta a punta.
5. **Datos de demo con sabor local** — destinos reales del contexto UJAP (la universidad en Valencia, zonas cercanas como San Diego, Naguanaguá) y tarifas de ejemplo expresadas en Bs con referencia en USD, mencionando que la conversión usará la tasa oficial del [BCV](https://www.bcv.org.ve).

### No incluye ❌ (se difiere)

- Autenticación / registro.
- Mapa funcional con geolocalización.
- Creación real de viajes por usuarios.
- Pagos.

---

## Tareas

### 1. UI base en React Native (lun 17 – mar 18)

- [ ] Recrear los componentes `AppInput`, `AppButton` y la barra de navegación usando los tokens de diseño extraídos en la Fase 1.
  📖 Para la navegación por tabs, la solución estándar del ecosistema Expo es Expo Router (file-based) o React Navigation: [docs.expo.dev/router/introduction](https://docs.expo.dev/router/introduction/) · [reactnavigation.org/docs/bottom-tab-navigator](https://reactnavigation.org/docs/bottom-tab-navigator)
  💡 El template Vue usa iconos de Lucide; existe el paquete equivalente para React Native — revisen [lucide.dev/guide/packages/lucide-react-native](https://lucide.dev/guide/packages/lucide-react-native) para mantener consistencia visual.
- [ ] Pantalla de inicio completa con el placeholder del mapa.
- [ ] Pantallas placeholder para Viajes, Historial y Perfil.

### 2. Backend mínimo (lun 17 – mar 18, en paralelo)

- [ ] Definir en Drizzle una tabla `viajes` mínima (origen, destino, hora de salida, asientos, precio en Bs y USD).
  📖 [orm.drizzle.team/docs/sql-schema-declaration](https://orm.drizzle.team/docs/sql-schema-declaration)
- [ ] Script de seed con 5–10 viajes de ejemplo con destinos reales del área de la UJAP.
  📖 Drizzle documenta el patrón de seeding: [orm.drizzle.team/docs/seed-overview](https://orm.drizzle.team/docs/seed-overview)
- [ ] Endpoint `GET /viajes?destino=...` en Fastify con validación de query params.
  💡 Fastify valida con JSON Schema de forma nativa; entender esto ahora define el estándar de todos los endpoints futuros: [fastify.dev/docs/latest/Reference/Validation-and-Serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/)
- [ ] Tipar el contrato de respuesta en `packages/shared` para que móvil y API compartan la misma definición de `Viaje`.

### 3. Integración y demo (mar 18 – mié 19)

- [ ] Conectar "Buscar viaje" con el endpoint y renderizar resultados en una lista.
- [ ] Probar la demo en un dispositivo Android físico con datos móviles (no solo WiFi — condición realista para usuarios en Venezuela).
- [ ] Preparar el guion de la demo para el cliente: qué se muestra, qué es placeholder, y qué viene en la Fase 4.
- [ ] (Stretch, solo si sobra tiempo) Deploy temprano del API en Railway o Render para demostrar desde un backend público: [docs.railway.com/quick-start](https://docs.railway.com/quick-start) · [render.com/docs/deploy-fastify](https://render.com/docs)

---

## Decisión pendiente: librería de mapas

No se decide en esta fase, pero conviene dejar registradas las candidatas para evaluarlas en la Fase 3:

| Candidata | Notas | Docs |
|---|---|---|
| `react-native-maps` | Estándar de facto; Google Maps en Android | [github.com/react-native-maps/react-native-maps](https://github.com/react-native-maps/react-native-maps) |
| Expo Maps | Integración nativa con el ecosistema Expo | [docs.expo.dev/versions/latest/sdk/maps](https://docs.expo.dev/versions/latest/sdk/maps/) |
| Mapbox (`@rnmapbox/maps`) | Mejor personalización; evaluar costos y cobertura de mapas en Venezuela | [rnmapbox.github.io](https://rnmapbox.github.io/) |

**Criterios de evaluación sugeridos:** costo (facturación en USD — relevante para el presupuesto del cliente), calidad de la cartografía de Valencia/Carabobo, funcionamiento con conectividad limitada, y soporte en Expo.

---

## Criterios de aceptación

1. La demo corre en Expo Go en un teléfono Android real.
2. El flujo inicio → buscar → resultados usa datos reales de PostgreSQL a través del API.
3. El cliente puede navegar los 4 tabs sin errores.
4. Existe un documento corto de "qué es real y qué es placeholder" para la reunión de entrega.
