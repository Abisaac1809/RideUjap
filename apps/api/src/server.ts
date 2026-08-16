import Fastify from "fastify";
import type { Viaje } from "@rideujap/shared";

const app = Fastify({ logger: true });

app.get("/health", async () => {
  return { status: "ok" };
});

app.get("/viajes", async (): Promise<Viaje[]> => {
  return [
    {
      id: 1,
      origen: "UJAP",
      destino: "San Diego",
      hora: "07:30",
      cuposDisponibles: 3,
    },
  ];
});

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
