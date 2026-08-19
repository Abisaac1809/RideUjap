import cors from "@fastify/cors";
import Fastify from "fastify";

import { authRoutes } from "./auth/routes";
import { healthRoutes } from "./health/routes";
import { myTripsRoutes } from "./my-trips/routes";
import { placesRoutes } from "./places/routes";
import { reservationsRoutes } from "./reservations/routes";
import { tripRoutes } from "./trips/routes";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true, credentials: true });

await app.register(authRoutes);
await app.register(healthRoutes);
await app.register(tripRoutes);
await app.register(placesRoutes);
await app.register(reservationsRoutes);
await app.register(myTripsRoutes);

const port = Number(process.env.PORT ?? 3000);

app
  .listen({ port, host: "0.0.0.0" })
  .then((address) => {
    app.log.info(`API listening on ${address}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
