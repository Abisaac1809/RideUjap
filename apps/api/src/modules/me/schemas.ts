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

const nameField = {
  type: "string",
  minLength: 1,
  maxLength: 255,
};

const phoneField = {
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
      name: nameField,
      image: { type: ["string", "null"], minLength: 1, maxLength: 2048 },
      phone: phoneField,
    },
  },
  response: { 200: meResponse },
};
