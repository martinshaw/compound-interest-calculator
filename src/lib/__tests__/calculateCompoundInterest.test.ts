import assert from "node:assert/strict";
import {
  calculateCompoundInterest,
  formatInterestRatePercent,
  formatMoney,
  futureValue,
  parseInterestRatePercent,
  parseMoneyInput,
  parseYearCount,
  roundTo,
} from "../calculateCompoundInterest";

function almostEqual(a: number, b: number, epsilon = 0.02) {
  assert.ok(
    Math.abs(a - b) <= epsilon,
    `Expected ${a} ≈ ${b} (epsilon ${epsilon})`
  );
}

// --- futureValue closed form ---
{
  const fv = futureValue(10000, 0.07, 40, 1000);
  almostEqual(fv, 349379.690380741, 0.01);
}

{
  // Zero rate degenerates to principal + contributions * years
  assert.equal(futureValue(1000, 0, 10, 100), 2000);
}

{
  assert.equal(futureValue(1000, 0.05, 0, 100), 1000);
  assert.ok(Number.isNaN(futureValue(1000, 0.05, -1, 100)));
}

// --- year-by-year series matches closed form (within rounding) ---
{
  const series = calculateCompoundInterest({
    principal: 10000,
    years: 40,
    annualRate: 0.07,
    yearlyContribution: 1000,
    startYear: 2020,
    currencyDecimals: 2,
  });

  assert.equal(series.length, 41); // start + 40 years
  assert.equal(series[0].year, "2020");
  assert.equal(series[0].amountOfMoney, 10000);
  assert.equal(series[0].interestEarned, 0);
  assert.equal(series[0].totalContributions, 0);
  assert.equal(series[40].year, "2060");
  assert.equal(series[40].totalContributions, 40000);

  const closed = futureValue(10000, 0.07, 40, 1000);
  // Cent rounding each year drifts slightly from pure closed form
  almostEqual(series[40].amountOfMoney, closed, 1.5);
}

// --- simple known case: £1000 for 1 year at 10%, no contribution ---
{
  const series = calculateCompoundInterest({
    principal: 1000,
    years: 1,
    annualRate: 0.1,
    yearlyContribution: 0,
    startYear: 2000,
  });
  assert.equal(series.length, 2);
  assert.equal(series[1].amountOfMoney, 1100);
  assert.equal(series[1].interestEarned, 100);
  assert.equal(series[1].totalInterest, 100);
}

// --- end-of-year contribution does NOT earn interest in the year added ---
{
  const series = calculateCompoundInterest({
    principal: 1000,
    years: 1,
    annualRate: 0.1,
    yearlyContribution: 100,
    startYear: 2000,
  });
  // 1000 * 1.1 + 100 = 1200 (not (1000+100)*1.1 = 1210)
  assert.equal(series[1].amountOfMoney, 1200);
  assert.equal(series[1].totalContributions, 100);
}

// --- floating-point money is rounded to cents ---
{
  const series = calculateCompoundInterest({
    principal: 1000,
    years: 10,
    annualRate: 0.07,
    yearlyContribution: 100,
  });
  for (const point of series) {
    const cents = roundTo(point.amountOfMoney * 100, 0);
    almostEqual(point.amountOfMoney * 100, cents, 1e-9);
  }
}

// --- invalid inputs yield empty series ---
{
  assert.deepEqual(
    calculateCompoundInterest({ principal: NaN, years: 10, annualRate: 0.05 }),
    []
  );
  assert.deepEqual(
    calculateCompoundInterest({ principal: 1000, years: -1, annualRate: 0.05 }),
    []
  );
  assert.deepEqual(
    calculateCompoundInterest({ principal: 1000, years: 2.5, annualRate: 0.05 }),
    []
  );
}

// --- interest rate parsing / formatting (the toFixed(0) bug) ---
{
  assert.equal(parseInterestRatePercent("7"), 0.07);
  assert.equal(parseInterestRatePercent("7.5"), 0.075);
  assert.equal(parseInterestRatePercent("7,5"), 0.075); // EU mobile decimal pad
  assert.equal(parseInterestRatePercent("7.25%"), 0.0725);
  assert.equal(parseInterestRatePercent(""), null);
  assert.equal(formatInterestRatePercent(0.07), "7");
  assert.equal(formatInterestRatePercent(0.075), "7.5");
  // Must NOT round 7.5% up to 8
  assert.notEqual(formatInterestRatePercent(0.075), "8");
}

// --- year parsing (the string-length → 9999 bug) ---
{
  assert.equal(parseYearCount("40"), 40);
  assert.equal(parseYearCount("40.55"), 40); // floor, not 9999
  assert.equal(parseYearCount("10000"), 500); // capped
  assert.equal(parseYearCount("-5"), null);
  assert.equal(parseYearCount(""), null);
}

// --- money parsing ---
{
  assert.equal(parseMoneyInput("1,000"), 1000);
  assert.equal(parseMoneyInput("1000.50"), 1000.5);
  assert.equal(parseMoneyInput("1000,50"), 1000.5); // EU decimal comma
  assert.equal(parseMoneyInput("1.000,50"), 1000.5); // EU thousands + decimal
  assert.equal(parseMoneyInput(""), null);
}

// --- formatMoney uses options correctly (the toLocaleString locale bug) ---
{
  const formatted = formatMoney(3348.7961534175174);
  assert.equal(formatted, (3348.8).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }));
  // Must not look like unrounded float noise
  assert.ok(!formatted.includes("3348.796"));
}

console.log("All compound interest tests passed.");
