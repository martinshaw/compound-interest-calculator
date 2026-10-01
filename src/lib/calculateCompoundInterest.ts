/**
 * Compound interest calculations for the yearly investment chart.
 *
 * Uses ordinary-annuity (end-of-year) contributions:
 *   balance_{t+1} = balance_t * (1 + r) + contribution
 *
 * Closed form (for r !== 0):
 *   FV = P*(1+r)^n + PMT * (((1+r)^n - 1) / r)
 */

export type CompoundInterestInput = {
  principal: number;
  years: number;
  annualRate: number;
  yearlyContribution?: number;
  /** Calendar year label for the starting point (default: current year). */
  startYear?: number;
  /** Decimal places for currency rounding after each year (default: 2). */
  currencyDecimals?: number;
};

export type CompoundInterestPoint = {
  year: string;
  /** Years elapsed from the start (0 = today). */
  yearsElapsed: number;
  yAxisValue: number;
  amountOfMoney: number;
  /** Interest earned during this year (0 at year 0). */
  interestEarned: number;
  /** Total contributions added up to this point (excluding principal). */
  totalContributions: number;
  /** Total interest earned since the start. */
  totalInterest: number;
};

export type CompoundInterestResult = CompoundInterestPoint[];

export function roundTo(value: number, decimals: number): number {
  if (!Number.isFinite(value)) return value;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Future value after `years` using the closed-form ordinary annuity formula.
 * Useful for verification and for non-iterative checks.
 */
export function futureValue(
  principal: number,
  annualRate: number,
  years: number,
  yearlyContribution = 0
): number {
  if (!Number.isFinite(principal) || !Number.isFinite(annualRate) || !Number.isFinite(years)) {
    return NaN;
  }
  if (years < 0) return NaN;
  if (years === 0) return principal;

  if (annualRate === 0) {
    return principal + yearlyContribution * years;
  }

  const growth = Math.pow(1 + annualRate, years);
  return principal * growth + yearlyContribution * ((growth - 1) / annualRate);
}

/**
 * Build year-by-year chart data for compound interest with annual contributions.
 *
 * Contributions are applied at the end of each year (after that year's interest),
 * matching the standard ordinary-annuity future-value formula.
 */
export function calculateCompoundInterest(
  input: CompoundInterestInput
): CompoundInterestResult {
  const {
    principal,
    years,
    annualRate,
    yearlyContribution = 0,
    startYear = new Date().getFullYear(),
    currencyDecimals = 2,
  } = input;

  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(years) ||
    !Number.isFinite(annualRate) ||
    !Number.isFinite(yearlyContribution) ||
    years < 0 ||
    !Number.isInteger(years)
  ) {
    return [];
  }

  const result: CompoundInterestResult = [];
  let balance = roundTo(principal, currencyDecimals);
  let totalContributions = 0;
  let totalInterest = 0;
  let interestEarnedThisYear = 0;

  for (let yearIndex = 0; yearIndex <= years; yearIndex++) {
    result.push({
      year: (startYear + yearIndex).toString(),
      yearsElapsed: yearIndex,
      yAxisValue: balance,
      amountOfMoney: balance,
      interestEarned: interestEarnedThisYear,
      totalContributions,
      totalInterest,
    });

    if (yearIndex === years) break;

    interestEarnedThisYear = roundTo(balance * annualRate, currencyDecimals);
    balance = roundTo(balance + interestEarnedThisYear + yearlyContribution, currencyDecimals);
    totalContributions = roundTo(totalContributions + yearlyContribution, currencyDecimals);
    totalInterest = roundTo(totalInterest + interestEarnedThisYear, currencyDecimals);
  }

  return result;
}

/**
 * Parse a user-entered percentage (e.g. "7", "7.5", "7.25%") into a decimal rate.
 */
export function parseInterestRatePercent(raw: string): number | null {
  const cleaned = raw
    .replaceAll(' ', '')
    .replaceAll('\n', '')
    .replaceAll(',', '')
    .replaceAll('<br>', '')
    .replace(/%/g, '');
  if (cleaned === '' || cleaned === '.' || cleaned === '-' || cleaned === '-.') return null;
  const value = parseFloat(cleaned);
  if (!Number.isFinite(value)) return null;
  return value / 100;
}

/**
 * Format a decimal interest rate as a percentage string for display/editing.
 * Preserves fractional percentages (e.g. 7.5) instead of rounding to an integer.
 */
export function formatInterestRatePercent(decimalRate: number, maxDecimals = 4): string {
  if (!Number.isFinite(decimalRate)) return '';
  const pct = decimalRate * 100;
  const factor = 10 ** maxDecimals;
  const rounded = Math.round(pct * factor) / factor;
  if (Number.isInteger(rounded)) return String(rounded);
  return String(rounded);
}

/**
 * Parse a non-negative integer year count from user input.
 * Caps at `maxYears` to avoid overflow to Infinity in JS numbers.
 */
export function parseYearCount(raw: string, maxYears = 500): number | null {
  const cleaned = raw
    .replaceAll(' ', '')
    .replaceAll('\n', '')
    .replaceAll(',', '')
    .replaceAll('<br>', '');
  if (cleaned === '') return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  const years = Math.floor(value);
  return Math.min(years, maxYears);
}

/**
 * Parse a currency/money amount from user input.
 * Strips whitespace, thousands separators, and HTML line breaks.
 */
export function parseMoneyInput(raw: string): number | null {
  const cleaned = raw
    .replaceAll(' ', '')
    .replaceAll('\n', '')
    .replaceAll(',', '')
    .replaceAll('<br>', '');
  if (cleaned === '' || cleaned === '.' || cleaned === '-' || cleaned === '-.') return null;
  const value = parseFloat(cleaned);
  if (!Number.isFinite(value)) return null;
  return value;
}

/**
 * Format a money amount for display with a fixed number of fraction digits.
 */
export function formatMoney(amount: number, fractionDigits = 2): string {
  if (!Number.isFinite(amount)) return '—';
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}
