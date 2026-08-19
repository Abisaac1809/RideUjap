# Fase 2 — Horarios, tracking y seguridad

**Estado:** 🔭 horizonte de producto — no planificada en detalle
**Precondición:** MVP probado con estudiantes reales ([Fase 1](./01-FASE-MVP.md)).

> Esta fase corresponde a la **Fase 2** definida en la [sección 4 del plan MVP](./PLAN-MVP-MOVILIDAD-UJAP.md). Aquí entra el diferenciador real del producto: que la app conozca el contexto académico, algo que ninguna app general puede aprovechar.

---

## Alcance previsto

### 1. Matching por horario de clases — *el diferenciador*

Que el estudiante cargue su horario y la app deduzca a qué hora necesita llegar y salir, en lugar de pedirle que lo escriba en cada búsqueda. Uber y Yummy no pueden hacer esto; la UJAP sí tiene horarios.

### 2. Viaje ida + vuelta pre-armado desde el horario

Del horario salen dos trayectos al día, no uno. Publicar y reservar ambos en un solo gesto.

### 3. Viajes recurrentes automáticos

Un horario de clases se repite todas las semanas. El viaje también debería.

### 4. Tracking en vivo del conductor

Mapa en tiempo real para que el pasajero sepa cuándo salir a la calle. Es la primera funcionalidad que exige una librería de mapas real y una decisión de infraestructura de posición en vivo.

### 5. Compartir viaje en vivo con un contacto

Seguridad, sobre todo en viajes nocturnos: enviar un enlace de seguimiento a un familiar o amigo.

### 6. Botón de pánico

Complemento del punto anterior. Requiere definir a quién notifica y con qué información.

### 7. Verificación con correo institucional

El MVP acepta cualquier correo a propósito, para no frenar la prueba. Cerrar la comunidad a correos UJAP es lo que convierte "una app de carpooling" en "la app de la universidad", y es requisito previo para cualquier promesa de seguridad.

---

## Por qué nada de esto está en el MVP

Todas estas piezas presuponen que **el flujo base funciona y que la gente lo usa**. Construir matching por horario antes de saber si un conductor está dispuesto a desviarse por la comisión ofrecida es invertir en el techo antes que en los cimientos.

El MVP existe para responder una pregunta: *¿hay conductores y pasajeros dispuestos a hacer esto?* Esta fase solo tiene sentido si la respuesta es sí.

## Decisiones que habrá que tomar

- Origen del horario académico: ¿carga manual del estudiante, o integración con algún sistema de la UJAP?
- Librería de mapas y proveedor de posición en vivo (ver candidatas evaluadas en la [Fase 0](./00-FASE-PREPARACION.md)).
- Mecanismo de verificación institucional: correo con dominio `@ujap`, ¿validación por código?
- Protocolo del botón de pánico: a quién avisa y con qué datos.
