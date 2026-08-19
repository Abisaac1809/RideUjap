/** Schema de respuesta de un viaje, reutilizado por las rutas que lo devuelven. */
export const tripJsonSchema = {
  type: "object",
  required: [
    "id",
    "direction",
    "pointText",
    "pointLat",
    "pointLng",
    "departureTime",
    "availableSeats",
    "totalSeats",
    "admissionMode",
    "farePerPassenger",
    "status",
    "driver",
  ],
  properties: {
    id: { type: "string" },
    direction: { type: "string", enum: ["outbound", "inbound"] },
    pointText: { type: "string" },
    pointLat: { type: "number" },
    pointLng: { type: "number" },
    departureTime: { type: "string" },
    availableSeats: { type: "integer" },
    totalSeats: { type: "integer" },
    admissionMode: { type: "string", enum: ["auto", "request"] },
    farePerPassenger: { type: ["number", "null"] },
    status: { type: "string", enum: ["active", "completed", "cancelled"] },
    driver: {
      type: "object",
      required: ["id", "name", "image"],
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        image: { type: ["string", "null"] },
      },
    },
  },
};

export const searchTripsSchema = {
  querystring: {
    type: "object",
    additionalProperties: false,
    properties: {
      direction: { type: "string", enum: ["outbound", "inbound"] },
      lat: { type: "number", minimum: -90, maximum: 90 },
      lng: { type: "number", minimum: -180, maximum: 180 },
      time: { type: "string", minLength: 1 },
      destination: { type: "string", minLength: 1, maxLength: 100 },
    },
  },
  response: { 200: { type: "array", items: tripJsonSchema } },
};

export const fareEstimateSchema = {
  querystring: {
    type: "object",
    additionalProperties: false,
    required: ["lat", "lng", "seats"],
    properties: {
      lat: { type: "number", minimum: -90, maximum: 90 },
      lng: { type: "number", minimum: -180, maximum: 180 },
      seats: { type: "integer", minimum: 1 },
    },
  },
  response: {
    200: {
      type: "object",
      required: ["suggestedFare"],
      properties: { suggestedFare: { type: "number" } },
    },
  },
};

export const createTripSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    required: [
      "direction",
      "pointLat",
      "pointLng",
      "pointText",
      "departureTime",
      "totalSeats",
      "admissionMode",
      "fare",
    ],
    properties: {
      direction: { type: "string", enum: ["outbound", "inbound"] },
      pointLat: { type: "number", minimum: -90, maximum: 90 },
      pointLng: { type: "number", minimum: -180, maximum: 180 },
      pointText: { type: "string", minLength: 1, maxLength: 200 },
      departureTime: { type: "string", minLength: 1 },
      totalSeats: { type: "integer", minimum: 1, maximum: 8 },
      admissionMode: { type: "string", enum: ["auto", "request"] },
      fare: { type: "number", minimum: 0 },
    },
  },
  response: { 201: tripJsonSchema },
};
