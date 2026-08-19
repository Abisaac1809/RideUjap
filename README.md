# RideUJAP

## Descripción

RideUJAP es una app de **carpooling universitario** para la comunidad de la Universidad José Antonio Páez. Un estudiante que ya va a la UJAP en carro ofrece los puestos libres a otros que viven cerca de su ruta y van a la misma hora: reparte los gastos de gasolina y recibe una comisión por el servicio.

No es ride-hailing. El destino es fijo (la UJAP), el emparejamiento se hace por cercanía y hora, y la coordinación final ocurre por WhatsApp. El flujo del producto es:

**Publicar → Buscar → Reservar → Contactar por WhatsApp → Calificar**

El proyecto está organizado como un monorepo con una API backend y una aplicación móvil, que comparten las entidades de dominio a través de un paquete común.

## Documentación

| Documento                                     | Para qué                                                                         |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| [Roadmap](./docs/00-ROADMAP.md)               | Fases del proyecto, stack y estado general                                       |
| [Plan MVP](./docs/PLAN-MVP-MOVILIDAD-UJAP.md) | Especificación funcional: alcance, motor de tarifa, modelo de datos y matching   |
| [Fase 1 — MVP](./docs/01-FASE-MVP.md)         | Plan de ejecución en curso: módulos, orden de dependencias y decisiones abiertas |

## Estado actual

El repositorio está en la **[Fase 1 — MVP de Movilidad](./docs/01-FASE-MVP.md)**.

Lo que hay hoy en `main` es el **prototipo de demostración** de la [Fase 0](./docs/00-FASE-PREPARACION.md): pantalla de inicio, navegación por tabs, placeholder de mapa y un endpoint `GET /viajes?destino=` con datos de ejemplo. Sirve como base visual, pero su modelo de datos (`origen`, `destino`, `precio_bs`) **no es el del MVP** y lo reemplazan los módulos en desarrollo:

| Módulo             | Qué aporta                                                        | Issues                                                                                                          |
| ------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Auth y Schema Base | Better Auth + Drizzle, tablas `user`, `viaje` y `reserva`, sesión | [#1](https://github.com/Abisaac1809/RideUjap/issues/1)                                                          |
| Usuarios           | Perfil del estudiante (`/me`), registro y login en el móvil       | [#2](https://github.com/Abisaac1809/RideUjap/issues/2) · [#5](https://github.com/Abisaac1809/RideUjap/issues/5) |
| Viajes             | Motor de tarifa, publicar y buscar viajes                         | [#3](https://github.com/Abisaac1809/RideUjap/issues/3) · [#6](https://github.com/Abisaac1809/RideUjap/issues/6) |
| Reservas           | Reservar, admisión, contacto por WhatsApp y "mis viajes"          | [#4](https://github.com/Abisaac1809/RideUjap/issues/4) · [#7](https://github.com/Abisaac1809/RideUjap/issues/7) |

## Requisitos

- **Node** >= 20
- **pnpm** 11 (gestor de paquetes del monorepo)
- **PostgreSQL** (base de datos de la API)
- **Expo Go** en un dispositivo o emulador para ejecutar la app móvil

## Inicio rápido

```bash
# 1. Instalar dependencias
pnpm install

# 2. Levantar PostgreSQL (Docker) y configurar la API
docker compose up -d
cp apps/api/.env.example apps/api/.env

# 3. Aplicar el esquema y cargar los datos de demostración
pnpm -F @rideujap/api db:migrate           # o db:push para sincronizar directo
pnpm -F @rideujap/api db:seed

# 4. Levantar todo el monorepo (API + app móvil)
pnpm dev
```

La app móvil no necesita configuración: deduce la IP de la máquina donde corre
Metro y busca el API en el puerto 3000, así que funciona en Expo Go sobre un
teléfono físico sin tocar nada. Si el API vive en otra máquina, define
`EXPO_PUBLIC_API_URL` en `apps/mobile/.env` (ver `apps/mobile/.env.example`).

Para ejecutar cada app por separado:

```bash
# API (http://localhost:3000)
pnpm --filter @rideujap/api dev

# App móvil (Expo Go)
pnpm --filter @rideujap/mobile start
```

Scripts útiles del monorepo:

```bash
pnpm lint          # ESLint en todos los paquetes
pnpm type-check    # Verificación de tipos con TypeScript
pnpm build         # Build de todos los paquetes
pnpm format        # Formateo con Prettier
```

Scripts de base de datos (desde `apps/api`):

```bash
pnpm -F @rideujap/api db:generate    # Generar migraciones desde el esquema
pnpm -F @rideujap/api db:migrate     # Aplicar migraciones
pnpm -F @rideujap/api db:push        # Sincronizar el esquema directamente
pnpm -F @rideujap/api db:seed        # Cargar viajes de demostración
pnpm -F @rideujap/api db:studio      # Abrir Drizzle Studio
```

## Tecnologías usadas

**Monorepo y tooling**

- Turborepo — orquestación de tareas
- pnpm workspaces — gestión de dependencias
- TypeScript
- ESLint + Prettier (configuraciones compartidas)
- Husky + lint-staged + Commitlint — control de calidad en los commits

**API**

- Fastify — servidor HTTP
- Drizzle ORM + drizzle-kit — acceso a datos y migraciones
- PostgreSQL (driver `postgres`)
- tsx — ejecución de TypeScript en desarrollo

**App móvil**

- Expo (React Native 0.86, React 19)
- Expo Router — navegación file-based
- NativeWind + Tailwind CSS — estilos
- react-native-web — soporte web

> La autenticación (Better Auth) y el cálculo de distancia (Haversine local, sin librería de mapas) entran con los módulos de la Fase 1. La plataforma de deploy sigue sin decidirse — ver [decisiones abiertas](./docs/01-FASE-MVP.md#decisiones-abiertas).

## Arquitectura

Monorepo gestionado con Turborepo y pnpm workspaces, dividido en aplicaciones, paquetes compartidos y configuración de tooling.

```
apps/
  api/       API backend con Fastify + TypeScript
    src/
      server.ts          Punto de entrada del servidor
      db/                Conexión, esquema y migraciones (Drizzle + PostgreSQL)
  mobile/    App móvil con Expo (React Native) + TypeScript
    src/
      components/ui/     Componentes de interfaz reutilizables
      lib/               Utilidades (p. ej. cn para clases)
packages/
  shared/    Entidades de dominio (TS) compartidas entre API y móvil
    src/                 conductor, pasajero, vehiculo, viaje
tooling/
  typescript/  tsconfig base (node / react-native)
  eslint/      config ESLint plana compartida
  prettier/    preset Prettier compartido
docs/
  roadmap, fases del proyecto y especificación del MVP
```

- **`packages/shared`** define las entidades del dominio (conductor, pasajero, vehículo, viaje) como fuente única de verdad, consumidas tanto por la API como por la app móvil.
- **`apps/api`** expone la lógica de negocio sobre Fastify y persiste los datos en PostgreSQL mediante Drizzle ORM, con migraciones versionadas en `src/db/migrations`.
- **`apps/mobile`** consume la API y ofrece la experiencia de usuario, con un sistema de componentes propio estilizado con NativeWind.
- **`tooling`** centraliza las configuraciones de TypeScript, ESLint y Prettier para mantener consistencia en todo el monorepo.
- **`docs`** documenta el producto y el plan de trabajo; el [roadmap](./docs/00-ROADMAP.md) es el punto de entrada.
