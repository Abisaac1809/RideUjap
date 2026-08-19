/** `unique_violation` de PostgreSQL: un índice único rechazó la escritura. */
const UNIQUE_VIOLATION = "23505";

/** Hasta dónde bajar por la cadena de `cause` antes de rendirse. */
const MAX_CAUSE_DEPTH = 5;

function hasUniqueViolationCode(value: object): boolean {
  return "code" in value && (value as { code?: unknown }).code === UNIQUE_VIOLATION;
}

/**
 * Drizzle envuelve el error del driver en un `DrizzleQueryError`, así que el
 * código de Postgres no está en la raíz sino más abajo en la cadena de `cause`.
 */
export function isUniqueViolation(err: unknown): boolean {
  let current: unknown = err;

  for (let depth = 0; depth < MAX_CAUSE_DEPTH; depth++) {
    if (typeof current !== "object" || current === null) return false;
    if (hasUniqueViolationCode(current)) return true;

    current = (current as { cause?: unknown }).cause;
  }

  return false;
}
