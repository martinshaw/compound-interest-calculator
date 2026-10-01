import assert from "node:assert/strict";
import {
  buildCalculatorSearchParams,
  readCalculatorUrlState,
} from "../urlState";

const symbols = ["£", "$", "€"] as const;

{
  const state = readCalculatorUrlState(
    "?amount=10000&years=40&rate=7.5&add=1000&currency=%C2%A3",
    symbols
  );
  assert.equal(state.amount, 10000);
  assert.equal(state.years, 40);
  assert.equal(state.ratePercent, 7.5);
  assert.equal(state.add, 1000);
  assert.equal(state.currency, "£");
}

{
  const qs = buildCalculatorSearchParams({
    amount: 10000,
    years: 40,
    rateDecimal: 0.07,
    add: 1000,
    currency: "$",
  });
  assert.equal(qs.includes("amount=10000"), true);
  assert.equal(qs.includes("years=40"), true);
  assert.equal(qs.includes("rate=7"), true);
  assert.equal(qs.includes("add=1000"), true);
  assert.equal(qs.includes("currency=%24") || qs.includes("currency=$"), true);
}

{
  const roundTrip = readCalculatorUrlState(
    "?" +
      buildCalculatorSearchParams({
        amount: 2500,
        years: 10,
        rateDecimal: 0.05,
        add: null,
        currency: "€",
      }),
    symbols
  );
  assert.equal(roundTrip.amount, 2500);
  assert.equal(roundTrip.years, 10);
  assert.equal(roundTrip.ratePercent, 5);
  assert.equal(roundTrip.add, null);
  assert.equal(roundTrip.currency, "€");
}

console.log("All urlState tests passed.");
