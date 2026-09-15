/** Los `id` llegan por la URL y van directo a columnas `uuid`: validarlos aquí
 * convierte un 500 de Postgres en un 400 limpio. */
const uuidParam = {
  type: "object",
  required: ["id"],
  additionalProperties: false,
  properties: {
    id: {
      type: "string",
      pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
  },
};

const reservationStatus = {
  type: "string",
  enum: ["enrolled", "requested", "accepted", "rejected"],
};

export const vehiclePublicSchema = {
  type: "object",
  required: ["make", "model", "year", "color", "plate"],
  properties: {
    make: { type: "string" },
    model: { type: "string" },
    year: { type: "integer" },
    color: { type: "string" },
    plate: { type: "string" },
  },
};

const reservationResponse = {
  type: "object",
  required: ["id", "tripId", "status", "createdAt", "availableSeats", "contactPhone", "vehicle"],
  properties: {
    id: { type: "string" },
    tripId: { type: "string" },
    status: reservationStatus,
    createdAt: { type: "string" },
    availableSeats: { type: "integer" },
    contactPhone: { type: ["string", "null"] },
    vehicle: { anyOf: [vehiclePublicSchema, { type: "null" }] },
  },
};

export const counterpartSchema = {
  type: "object",
  required: ["id", "name", "image", "phone"],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    image: { type: ["string", "null"] },
    phone: { type: ["string", "null"] },
  },
};

export const createReservationSchema = {
  params: uuidParam,
  response: { 201: reservationResponse },
};

export const decideReservationSchema = {
  params: uuidParam,
  body: {
    type: "object",
    required: ["status"],
    additionalProperties: false,
    properties: {
      status: { type: "string", enum: ["accepted", "rejected"] },
    },
  },
  response: { 200: reservationResponse },
};

export const contactSchema = {
  params: uuidParam,
  response: {
    200: {
      type: "object",
      required: ["reservationId", "status", "counterpart", "vehicle"],
      properties: {
        reservationId: { type: "string" },
        status: reservationStatus,
        counterpart: counterpartSchema,
        vehicle: { anyOf: [vehiclePublicSchema, { type: "null" }] },
      },
    },
  },
};

export { reservationStatus as reservationStatusSchema };
