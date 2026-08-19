/**
 * Validamos los `id` de usuario que vienen del `session.user` contra el patrón
 * que usa Better Auth en este proyecto (mantiene una sola fuente de verdad en
 * lugar de aceptar cualquier string).
 */
const userIdParam = {
  type: "object",
  required: ["id"],
  additionalProperties: false,
  properties: {
    id: {
      type: "string",
      minLength: 1,
      maxLength: 128,
    },
  },
};

const meResponse = {
  type: "object",
  required: ["id", "name", "email", "image", "phone"],
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    email: { type: "string" },
    image: { type: ["string", "null"] },
    phone: { type: "string" },
  },
};

const trimmedNonEmptyString = {
  type: "string",
  minLength: 1,
  maxLength: 255,
};

const trimmedNonEmptyPhone = {
  type: "string",
  pattern: "^[0-9+()\\-\\s]{6,32}$",
};

export const getMeSchema = {
  response: { 200: meResponse },
};

export const updateMeSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    minProperties: 1,
    properties: {
      name: trimmedNonEmptyString,
      image: { type: ["string", "null"], minLength: 1, maxLength: 2048 },
      phone: trimmedNonEmptyPhone,
    },
  },
  response: { 200: meResponse },
};

export { userIdParam };
