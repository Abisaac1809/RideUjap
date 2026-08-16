# RideUJAP

Monorepo (Turborepo + pnpm).

## Estructura

```
apps/
  api/       Fastify + TypeScript
  mobile/    Expo (React Native) + TypeScript
packages/
  shared/    Entidades de dominio (TS) compartidas
tooling/
  typescript/  tsconfig base (node / react-native)
  eslint/      config ESLint plana compartida
  prettier/    preset Prettier compartido
```

## Requisitos

- Node >= 20
- pnpm

## Uso

```bash
pnpm install

# API (http://localhost:3000)
pnpm -F @rideujap/api dev

# Mobile (Expo Go)
pnpm -F @rideujap/mobile start

# Todo el monorepo
pnpm dev (corre api y la app en conjunto)
pnpm lint (eslint)
pnpm type-check
pnpm build
pnpm format (prettier)
```
