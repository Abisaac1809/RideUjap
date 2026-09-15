const driverProfileSchema = {
  type: "object",
  required: ["id", "licenseNumber", "licenseExpiry", "createdAt"],
  properties: {
    id: { type: "string" },
    licenseNumber: { type: "string" },
    licenseExpiry: { type: "string" },
    createdAt: { type: "string" },
  },
};

const vehicleSchema = {
  type: "object",
  required: ["id", "make", "model", "year", "color", "plate", "seats"],
  properties: {
    id: { type: "string" },
    make: { type: "string" },
    model: { type: "string" },
    year: { type: "integer" },
    color: { type: "string" },
    plate: { type: "string" },
    seats: { type: "integer" },
  },
};

/**
 * Se devuelve como objeto fijo con ambas claves nulleables en lugar de una
 * unión o una respuesta `null` a secas: el serializador de Fastify no maneja
 * bien esos casos y terminaba silenciando campos.
 */
const driverStatusResponseSchema = {
  type: "object",
  required: ["driverProfile", "vehicle"],
  properties: {
    driverProfile: { anyOf: [driverProfileSchema, { type: "null" }] },
    vehicle: { anyOf: [vehicleSchema, { type: "null" }] },
  },
};

const vehicleBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["make", "model", "year", "color", "plate", "seats"],
  properties: {
    make: { type: "string", minLength: 1, maxLength: 60 },
    model: { type: "string", minLength: 1, maxLength: 60 },
    year: { type: "integer", minimum: 1980, maximum: 2100 },
    color: { type: "string", minLength: 1, maxLength: 40 },
    plate: { type: "string", minLength: 1, maxLength: 20 },
    seats: { type: "integer", minimum: 1, maximum: 8 },
  },
};

const driverOnboardingBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["licenseNumber", "licenseExpiry", "vehicle"],
  properties: {
    licenseNumber: { type: "string", minLength: 1, maxLength: 40 },
    licenseExpiry: { type: "string", minLength: 1 },
    vehicle: vehicleBodySchema,
  },
};

export const driverProfileGetSchema = {
  response: { 200: driverStatusResponseSchema },
};

export const driverOnboardingSchema = {
  body: driverOnboardingBodySchema,
  response: { 201: driverStatusResponseSchema },
};

export const driverProfileUpdateSchema = {
  body: driverOnboardingBodySchema,
  response: { 200: driverStatusResponseSchema },
};
