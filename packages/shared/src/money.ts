export type Currency = "USD" | "EUR";

/** Monto en USD con su equivalente en bolívares según la tasa del BCV. */
export interface Money {
  usd: number;
  ves: number | null;
  rateDate: string | null;
  stale: boolean;
}
