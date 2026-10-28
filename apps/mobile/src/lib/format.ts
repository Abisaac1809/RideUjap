import type { Money } from "@rideujap/shared";

function withComma(amount: number): string {
  return amount.toFixed(2).replace(".", ",");
}

export function formatBs(amount: number): string {
  return `Bs ${withComma(amount)}`;
}

function formatRateDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
}

export function formatFare(fare: Money | null): string {
  if (fare === null) return "A convenir";

  const usd = `$${withComma(fare.usd)}`;
  if (fare.ves === null) return usd;

  const amounts = `${usd} · ${formatBs(fare.ves)}`;
  if (!fare.stale || !fare.rateDate) return amounts;

  return `${amounts} (tasa del ${formatRateDate(fare.rateDate)})`;
}

export function formatSeats(seats: number): string {
  return seats === 1 ? "1 cupo" : `${seats} cupos`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatWhen(iso: string): string {
  const date = new Date(iso).toLocaleDateString("es-VE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  return `${date} · ${formatTime(iso)}`;
}
