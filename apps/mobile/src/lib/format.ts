function withComma(amount: number): string {
  return amount.toFixed(2).replace(".", ",");
}

export function formatFare(farePerPassenger: number | null): string {
  if (farePerPassenger === null) return "A convenir";
  return `Bs ${withComma(farePerPassenger)}`;
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
