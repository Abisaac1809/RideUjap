/** Separador decimal de coma, como se escriben los montos en Venezuela. */
function conComa(monto: number): string {
  return monto.toFixed(2).replace(".", ",");
}

/**
 * Arma la tarifa en Bs con su referencia en USD: "Bs 350,00 (~2,50 USD)".
 *
 * Un viaje sin tarifa fija se muestra como "A convenir": en un esquema de
 * carpooling es normal que los gastos se acuerden entre las partes.
 */
export function formatearTarifa(precioBs: number | null, precioUsd: number | null): string {
  if (precioBs === null) return "A convenir";

  const bs = `Bs ${conComa(precioBs)}`;
  return precioUsd === null ? bs : `${bs} (~${conComa(precioUsd)} USD)`;
}

/** "1 cupo" / "3 cupos". */
export function formatearCupos(cupos: number): string {
  return cupos === 1 ? "1 cupo" : `${cupos} cupos`;
}
