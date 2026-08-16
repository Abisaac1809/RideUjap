CREATE TABLE "viajes" (
	"id" serial PRIMARY KEY NOT NULL,
	"origen" text NOT NULL,
	"destino" text NOT NULL,
	"hora" text NOT NULL,
	"cupos_disponibles" integer DEFAULT 0 NOT NULL,
	"precio_bs" numeric(12, 2),
	"precio_usd" numeric(10, 2)
);
