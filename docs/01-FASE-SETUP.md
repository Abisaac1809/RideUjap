# Fase 1 — Setup del monorepo

**Deadline: Lunes 17 de agosto de 2026**
**Objetivo:** migrar el template existente de Vue.js (RideUjap) a un monorepo multipaquete con Turborepo + PNPM, dejando la base lista para React Native (Expo) y Fastify.

---

## Contexto

El repo actual es un proyecto Vue 3 + Vite standalone con:

- Una pantalla de inicio ("¿A dónde vas hoy?") con búsqueda de destino.
- Componentes reutilizables: `AppInput`, `AppButton`, `BottomNavbar` (Inicio, Viajes, Historial, Perfil).
- Ya usa PNPM como gestor de paquetes.

**Decisión clave a documentar en esta fase:** el template Vue **no se porta como código** al frontend final (el stack es React Native). Su valor es servir como **referencia de diseño y de flujo de UX**. En el monorepo puede vivir como `apps/web-reference` (o eliminarse tras extraer los tokens de diseño: colores `--accent`, `--muted`, radios, espaciados).

---

## Estructura objetivo

```
rideujap/
├── apps/
│   ├── mobile/          # React Native + Expo + TypeScript
│   ├── api/             # Fastify + Drizzle + TypeScript
│   └── web-reference/   # (opcional) template Vue original como referencia UX
├── packages/
│   ├── shared/          # Tipos y contratos compartidos (ej. modelos de Viaje, Usuario)
│   ├── config-ts/       # tsconfig base compartido
│   └── config-eslint/   # reglas de lint compartidas
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

> Esto es una estructura de ejemplo, no un mandato — ajústenla según lo que el equipo encuentre cómodo. La guía oficial de estructura de repos de Turborepo explica el razonamiento detrás de `apps/` vs `packages/`: [turborepo.com/docs/crafting-your-repository/structuring-a-repository](https://turborepo.com/docs/crafting-your-repository/structuring-a-repository)

---

## Tareas

### 1. Inicializar el workspace (jue 13 – vie 14)

- [ ] Crear la raíz del monorepo y el archivo `pnpm-workspace.yaml` que declare `apps/*` y `packages/*`.
  📖 [pnpm.io/workspaces](https://pnpm.io/workspaces) — presten atención a cómo se referencian paquetes internos con el protocolo `workspace:`.
- [ ] Agregar Turborepo y definir `turbo.json` con las tareas base (`build`, `dev`, `lint`, `typecheck`).
  📖 [turborepo.com/docs/getting-started/add-to-existing-repository](https://turborepo.com/docs/getting-started/add-to-existing-repository)
  💡 Concepto importante: en Turborepo cada tarea declara sus `dependsOn` y `outputs` para que el caché funcione. Lean la sección de [Configuring tasks](https://turborepo.com/docs/crafting-your-repository/configuring-tasks) antes de escribir el archivo.
- [ ] Mover el template Vue a `apps/web-reference` y verificar que `pnpm dev` siga funcionando desde la raíz (esto valida que el workspace quedó bien configurado).

### 2. Scaffold de la app móvil (vie 14 – sáb 15)

- [ ] Crear `apps/mobile` con Expo + TypeScript.
  📖 Expo tiene una guía específica para monorepos con PNPM que resuelve los problemas típicos de resolución de módulos: [docs.expo.dev/guides/monorepos](https://docs.expo.dev/guides/monorepos/)
  ⚠️ Punto delicado conocido: React Native + PNPM requiere configurar cómo Metro resuelve dependencias en workspaces. La guía anterior cubre exactamente ese caso — no lo salten.
- [ ] Verificar que la app corre en Expo Go en al menos un dispositivo físico Android (el más común entre estudiantes UJAP).

### 3. Scaffold del API (sáb 15 – dom 16)

- [ ] Crear `apps/api` con Fastify + TypeScript.
  📖 [fastify.dev/docs/latest/Reference/TypeScript](https://fastify.dev/docs/latest/Reference/TypeScript/) — muestra los patrones de tipado de rutas que conviene adoptar desde el día 1.
- [ ] Configurar Drizzle apuntando a un PostgreSQL local (Docker es la vía más simple para el equipo).
  📖 [orm.drizzle.team/docs/get-started-postgresql](https://orm.drizzle.team/docs/get-started-postgresql)
  💡 Concepto: Drizzle define el esquema en TypeScript y genera migraciones con `drizzle-kit`. Entender el flujo *schema → generate → migrate* evita dolores después: [orm.drizzle.team/docs/migrations](https://orm.drizzle.team/docs/migrations)
- [ ] Un solo endpoint de prueba (ej. `GET /health`) que confirme conexión a la base de datos.

### 4. Paquete compartido y cierre (dom 16 – lun 17)

- [ ] Crear `packages/shared` con los primeros tipos del dominio (ej. la forma de un `Viaje` con origen, destino, hora). Que `mobile` y `api` lo importen para validar el grafo de dependencias.
- [ ] `pnpm turbo build` y `pnpm turbo lint` pasan en verde desde la raíz.
- [ ] Actualizar el `README.md` raíz: cómo instalar, cómo levantar cada app, estructura del repo.

---

## Criterios de aceptación (Definition of Done)

1. Un integrante nuevo puede clonar, correr `pnpm install` y levantar `mobile` + `api` siguiendo solo el README.
2. Turborepo cachea builds correctamente (segunda corrida de `turbo build` es casi instantánea).
3. Los tokens de diseño del template Vue quedaron documentados (colores, tipografía, radios) para replicarlos en React Native durante la Fase 2.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Metro/PNPM: módulos no resueltos en el monorepo | Seguir la guía oficial de Expo para monorepos *antes* de improvisar |
| El fin de semana reduce disponibilidad del equipo | Terminar los scaffolds críticos (mobile + api) antes del sábado |
| Perder el trabajo de diseño del template Vue | Extraer tokens de diseño como primera tarea, no como última |
