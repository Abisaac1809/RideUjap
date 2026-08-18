# RideUJAP

## Descripción

RideUJAP es una aplicación de transporte compartido (ride-sharing) para la comunidad de la UJAP, que conecta conductores y pasajeros para coordinar viajes y compartir gastos. El proyecto está organizado como un monorepo con una API backend y una aplicación móvil, que comparten las entidades de dominio a través de un paquete común.

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
- NativeWind + Tailwind CSS — estilos
- react-native-web — soporte web

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
```

- **`packages/shared`** define las entidades del dominio (conductor, pasajero, vehículo, viaje) como fuente única de verdad, consumidas tanto por la API como por la app móvil.
- **`apps/api`** expone la lógica de negocio sobre Fastify y persiste los datos en PostgreSQL mediante Drizzle ORM, con migraciones versionadas en `src/db/migrations`.
- **`apps/mobile`** consume la API y ofrece la experiencia de usuario, con un sistema de componentes propio estilizado con NativeWind.
- **`tooling`** centraliza las configuraciones de TypeScript, ESLint y Prettier para mantener consistencia en todo el monorepo.
