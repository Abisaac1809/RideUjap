import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida. Copia apps/api/.env.example a apps/api/.env");
}

// Cliente dedicado a migraciones: una sola conexión, se cierra al terminar.
const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });

async function main() {
  await migrate(drizzle(migrationClient), {
    migrationsFolder: "./src/db/migrations",
  });
  await migrationClient.end();
  console.log("Migraciones aplicadas correctamente");
}

main().catch((err) => {
  console.error("Error aplicando migraciones:", err);
  process.exit(1);
});
