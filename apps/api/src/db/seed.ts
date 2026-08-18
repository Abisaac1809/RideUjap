import { client, db } from "./index";
import { viajes, type NewViaje } from "./schema";

/**
 * Datos de demostración para la entrega del MVP (Fase 2).
 *
 * Destinos reales del entorno de la UJAP (Municipio San Diego, Valencia,
 * Carabobo): trayectos de ida desde el campus y de vuelta hacia él en los
 * horarios pico de la comunidad universitaria.
 *
 * Las tarifas son de ejemplo y están calculadas a una tasa fija de referencia
 * (ver TASA_BCV_DEMO). En producción la conversión debe consumir la tasa
 * oficial del BCV (https://www.bcv.org.ve); queda pendiente de definir en la
 * Fase 3 si se automatiza o se carga a mano.
 */
const TASA_BCV_DEMO = 140;

/** Construye el par de tarifas Bs/USD a partir del monto en bolívares. */
function tarifa(precioBs: number): Pick<NewViaje, "precioBs" | "precioUsd"> {
  return {
    precioBs: precioBs.toFixed(2),
    precioUsd: (precioBs / TASA_BCV_DEMO).toFixed(2),
  };
}

const viajesDemo: NewViaje[] = [
  // Salidas desde el campus
  { origen: "UJAP", destino: "San Diego", hora: "12:30", cuposDisponibles: 3, ...tarifa(140) },
  { origen: "UJAP", destino: "Naguanagua", hora: "17:00", cuposDisponibles: 2, ...tarifa(210) },
  {
    origen: "UJAP",
    destino: "Valencia — Av. Bolívar Norte",
    hora: "18:00",
    cuposDisponibles: 4,
    ...tarifa(350),
  },
  { origen: "UJAP", destino: "El Trigal", hora: "12:00", cuposDisponibles: 2, ...tarifa(280) },

  // Llegadas al campus
  { origen: "Naguanagua", destino: "UJAP", hora: "06:45", cuposDisponibles: 3, ...tarifa(210) },
  {
    origen: "San Diego — Los Molinos",
    destino: "UJAP",
    hora: "07:00",
    cuposDisponibles: 3,
    ...tarifa(140),
  },
  { origen: "Guacara", destino: "UJAP", hora: "06:30", cuposDisponibles: 2, ...tarifa(420) },

  // Sin tarifa fija: ejercita el caso "a convenir" en la app
  {
    origen: "UJAP",
    destino: "Mañongo",
    hora: "19:00",
    cuposDisponibles: 1,
    precioBs: null,
    precioUsd: null,
  },
];

async function main() {
  // Idempotente: reejecutar el seed deja siempre el mismo conjunto de datos.
  await db.delete(viajes);
  const insertados = await db.insert(viajes).values(viajesDemo).returning();

  console.log(`Seed completado: ${insertados.length} viajes de demostración insertados`);
  await client.end();
}

main().catch(async (err) => {
  console.error("Error ejecutando el seed:", err);
  await client.end();
  process.exit(1);
});
