/**
 * URL query sync for shareable calculator state.
 * Example: ?amount=10000&years=40&rate=7&add=1000&currency=%C2%A3
 */

export type CalculatorUrlState = {
  amount: number | null;
  years: number | null;
  ratePercent: number | null;
  add: number | null;
  currency: string | null;
};

export function readCalculatorUrlState(
  search: string,
  currencySymbols: readonly string[]
): CalculatorUrlState {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search
  );

  const amountRaw = params.get("amount");
  const yearsRaw = params.get("years");
  const rateRaw = params.get("rate");
  const addRaw = params.get("add");
  const currencyRaw = params.get("currency");

  const amount =
    amountRaw != null && amountRaw !== "" && Number.isFinite(Number(amountRaw))
      ? Number(amountRaw)
      : null;
  const years =
    yearsRaw != null && yearsRaw !== "" && Number.isFinite(Number(yearsRaw))
      ? Math.max(0, Math.floor(Number(yearsRaw)))
      : null;
  const ratePercent =
    rateRaw != null && rateRaw !== "" && Number.isFinite(Number(rateRaw))
      ? Number(rateRaw)
      : null;
  const add =
    addRaw != null && addRaw !== "" && Number.isFinite(Number(addRaw))
      ? Number(addRaw)
      : null;

  let currency: string | null = null;
  if (currencyRaw != null && currencyRaw !== "") {
    if (currencySymbols.includes(currencyRaw)) {
      currency = currencyRaw;
    } else {
      // Allow encoding quirks / aliases
      const decoded = decodeURIComponent(currencyRaw);
      if (currencySymbols.includes(decoded)) currency = decoded;
    }
  }

  return { amount, years, ratePercent, add, currency };
}

export function buildCalculatorSearchParams(state: {
  amount: number | null;
  years: number | null;
  /** Decimal rate e.g. 0.07 */
  rateDecimal: number | null;
  add: number | null;
  currency: string;
}): string {
  const params = new URLSearchParams();

  if (state.amount != null) params.set("amount", String(state.amount));
  if (state.years != null) params.set("years", String(state.years));
  if (state.rateDecimal != null) {
    const pct = Math.round(state.rateDecimal * 10000) / 100;
    params.set("rate", String(pct));
  }
  if (state.add != null && state.add !== 0) params.set("add", String(state.add));
  if (state.currency) params.set("currency", state.currency);

  return params.toString();
}
