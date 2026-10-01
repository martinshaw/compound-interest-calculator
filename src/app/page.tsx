"use client";

import { useDebounce } from "@uidotdev/usehooks";
import {
  ChangeEvent,
  FocusEventHandler,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Chart from "./Chart";
import {
  calculateCompoundInterest,
  formatInterestRatePercent,
  parseInterestRatePercent,
  parseMoneyInput,
  parseYearCount,
} from "../lib/calculateCompoundInterest";
import { buildCalculatorSearchParams, readCalculatorUrlState } from "../lib/urlState";

const CURRENCY_SYMBOLS = ["£", "$", "€", "¥", "₹", "₽", "₿", "₺", "₴", "₩", "₮", "₦"] as const;

function formatMoneyField(value: number | null): string {
  if (value == null) return "0";
  return value.toLocaleString();
}

export default function Home() {
  const [currentCurrencySymbolIndex, setCurrentCurrencySymbolIndex] = useState<number>(0);
  const urlHydrated = useRef(false);
  const moveCurrentCurrencySymbolIndex = (movement: "forward" | "backward") => {
    const nextIndex =
      movement === "forward" ? currentCurrencySymbolIndex + 1 : currentCurrencySymbolIndex - 1;

    if (nextIndex < 0) setCurrentCurrencySymbolIndex(CURRENCY_SYMBOLS.length - 1);
    else if (nextIndex >= CURRENCY_SYMBOLS.length) setCurrentCurrencySymbolIndex(0);
    else setCurrentCurrencySymbolIndex(nextIndex);
  };

  //

  const [amountValue, setAmountValue] = useState<number | null>(null);
  const [amountDraft, setAmountDraft] = useState("0");
  const [amountFocused, setAmountFocused] = useState(false);
  const debouncedAmountValue = useDebounce(amountValue, 250);

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setAmountDraft(raw);
    if (raw.trim() === "") {
      setAmountValue(null);
      return;
    }
    setAmountValue(parseMoneyInput(raw));
  };

  //

  const [yearValue, setYearValue] = useState<number | null>(40);
  const [yearDraft, setYearDraft] = useState("40");
  const [yearFocused, setYearFocused] = useState(false);
  const debouncedYearValue = useDebounce(yearValue, 250);

  const handleYearChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setYearDraft(raw);
    if (raw.trim() === "") {
      setYearValue(null);
      return;
    }
    setYearValue(parseYearCount(raw));
  };

  //

  const [yearlyAdditionValue, setYearlyAdditionValue] = useState<number | null>(null);
  const [yearlyAdditionDraft, setYearlyAdditionDraft] = useState("0");
  const [yearlyAdditionFocused, setYearlyAdditionFocused] = useState(false);
  const debouncedYearlyAdditionValue = useDebounce(yearlyAdditionValue, 250);

  const handleYearlyAdditionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setYearlyAdditionDraft(raw);
    if (raw.trim() === "") {
      setYearlyAdditionValue(null);
      return;
    }
    setYearlyAdditionValue(parseMoneyInput(raw));
  };

  //

  const [interestRateValue, setInterestRateValue] = useState<number | null>(0.07);
  const debouncedInterestRateValue = useDebounce(interestRateValue, 250);
  const [interestRateDraft, setInterestRateDraft] = useState<string>(
    formatInterestRatePercent(0.07)
  );
  const [interestRateFocused, setInterestRateFocused] = useState(false);

  const handleInterestRateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replaceAll(" ", "");
    setInterestRateDraft(raw);

    if (raw === "" || raw === "." || raw === "-" || raw === "-.") {
      setInterestRateValue(null);
      return;
    }

    setInterestRateValue(parseInterestRatePercent(raw));
  };

  // Hydrate from shareable URL once on mount. Defer enabling URL writes until
  // after React applies hydrated state and debounced values catch up, so we
  // never clobber incoming ?amount=…&years=… share links.
  useEffect(() => {
    const fromUrl = readCalculatorUrlState(window.location.search, CURRENCY_SYMBOLS);

    if (fromUrl.amount != null) {
      setAmountValue(fromUrl.amount);
      setAmountDraft(formatMoneyField(fromUrl.amount));
    }
    if (fromUrl.years != null) {
      setYearValue(fromUrl.years);
      setYearDraft(String(fromUrl.years));
    }
    if (fromUrl.ratePercent != null) {
      const decimal = fromUrl.ratePercent / 100;
      setInterestRateValue(decimal);
      setInterestRateDraft(formatInterestRatePercent(decimal));
    }
    if (fromUrl.add != null) {
      setYearlyAdditionValue(fromUrl.add);
      setYearlyAdditionDraft(formatMoneyField(fromUrl.add));
    }
    if (fromUrl.currency != null) {
      const idx = CURRENCY_SYMBOLS.indexOf(
        fromUrl.currency as (typeof CURRENCY_SYMBOLS)[number]
      );
      if (idx >= 0) setCurrentCurrencySymbolIndex(idx);
    }

    const enableTimer = window.setTimeout(() => {
      urlHydrated.current = true;
    }, 300);
    return () => window.clearTimeout(enableTimer);
  }, []);

  // Persist state to the URL for sharing (including currency)
  useEffect(() => {
    if (!urlHydrated.current) return;

    const qs = buildCalculatorSearchParams({
      amount: debouncedAmountValue,
      years: debouncedYearValue,
      rateDecimal: debouncedInterestRateValue,
      add: debouncedYearlyAdditionValue,
      currency: CURRENCY_SYMBOLS[currentCurrencySymbolIndex],
    });

    const next = qs
      ? `${window.location.pathname}?${qs}${window.location.hash}`
      : `${window.location.pathname}${window.location.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next !== current) {
      window.history.replaceState(null, "", next);
    }
  }, [
    debouncedAmountValue,
    debouncedYearValue,
    debouncedInterestRateValue,
    debouncedYearlyAdditionValue,
    currentCurrencySymbolIndex,
  ]);

  //
  const data: CompountChartDataType =
    debouncedAmountValue == null || debouncedYearValue == null
      ? []
      : calculateCompoundInterest({
          principal: debouncedAmountValue,
          years: debouncedYearValue,
          annualRate: debouncedInterestRateValue ?? 0,
          yearlyContribution: debouncedYearlyAdditionValue ?? 0,
        });

  //

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartReady, setChartReady] = useState(false);

  const markChartReady = useCallback(() => {
    const el = chartContainerRef.current;
    if (!el) return;
    setChartReady(el.clientWidth > 0 && el.clientHeight > 0);
  }, []);

  useEffect(() => {
    markChartReady();
    const el = chartContainerRef.current;
    if (!el || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", markChartReady);
      return () => window.removeEventListener("resize", markChartReady);
    }

    const observer = new ResizeObserver(() => markChartReady());
    observer.observe(el);
    return () => observer.disconnect();
  }, [markChartReady]);

  const selectAllOnFocus: FocusEventHandler<HTMLInputElement> = (event) => {
    // Defer so mobile browsers finish focusing before selecting
    requestAnimationFrame(() => event.target.select());
  };

  const amountDisplay = amountFocused ? amountDraft : formatMoneyField(amountValue);
  const yearDisplay = yearFocused ? yearDraft : (yearValue?.toString() ?? "");
  const yearlyAdditionDisplay = yearlyAdditionFocused
    ? yearlyAdditionDraft
    : formatMoneyField(yearlyAdditionValue);
  const interestRateDisplay = interestRateFocused
    ? interestRateDraft
    : formatInterestRatePercent(interestRateValue ?? 0);

  const currency = CURRENCY_SYMBOLS[currentCurrencySymbolIndex];

  return (
    <main className="flex min-h-[100dvh] lg:h-[100dvh] flex-col items-stretch justify-start gap-6 sm:gap-8 px-safe sm:px-5 lg:px-8 xl:px-10 pt-safe pb-safe select-none">
      <section
        aria-label="Investment inputs"
        className="calc-controls pt-2 sm:pt-6 lg:pt-10"
      >
        {/* Amount: £ + value */}
        <div className="calc-control-group">
          <button
            type="button"
            aria-label="Change currency"
            title="Tap to change currency"
            className="calc-currency-btn"
            onClick={() => moveCurrentCurrencySymbolIndex("forward")}
            onContextMenu={(event) => {
              event.preventDefault();
              moveCurrentCurrencySymbolIndex("backward");
            }}
          >
            {currency}
          </button>

          <input
            autoFocus
            inputMode="decimal"
            enterKeyHint="next"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Starting amount"
            size={Math.max(4, amountDisplay.length)}
            className={
              "calc-input calc-input-grow calc-input-grow-wide " +
              (amountValue == null || amountValue === 0 ? "calc-input-muted" : "calc-input-active")
            }
            value={amountDisplay}
            onChange={handleAmountChange}
            onFocus={(event) => {
              setAmountFocused(true);
              setAmountDraft(formatMoneyField(amountValue));
              selectAllOnFocus(event);
            }}
            onBlur={() => {
              setAmountFocused(false);
              setAmountDraft(formatMoneyField(amountValue));
            }}
          />
        </div>

        {/* for N years */}
        <div className="calc-control-group">
          <span className="calc-label">for</span>

          <input
            inputMode="numeric"
            pattern="[0-9]*"
            enterKeyHint="next"
            autoComplete="off"
            aria-label="Number of years"
            size={Math.max(3, yearDisplay.length)}
            className={
              "calc-input calc-input-grow " +
              (yearValue == null || yearValue === 0 ? "calc-input-muted" : "calc-input-active")
            }
            value={yearDisplay}
            onChange={handleYearChange}
            onFocus={(event) => {
              setYearFocused(true);
              setYearDraft(yearValue?.toString() ?? "");
              selectAllOnFocus(event);
            }}
            onBlur={() => {
              setYearFocused(false);
              setYearDraft(yearValue?.toString() ?? "");
            }}
          />

          <span className="calc-label">years</span>
        </div>

        {/* at R% */}
        <div className="calc-control-group">
          <span className="calc-label">at</span>

          <input
            inputMode="decimal"
            enterKeyHint="next"
            autoComplete="off"
            aria-label="Annual interest rate percent"
            size={Math.max(3, interestRateDisplay.length)}
            className={
              "calc-input calc-input-grow " +
              (interestRateValue == null || interestRateValue === 0
                ? "calc-input-muted"
                : "calc-input-active")
            }
            value={interestRateDisplay}
            onChange={handleInterestRateChange}
            onFocus={(event) => {
              setInterestRateFocused(true);
              setInterestRateDraft(formatInterestRatePercent(interestRateValue ?? 0));
              selectAllOnFocus(event);
            }}
            onBlur={() => {
              setInterestRateFocused(false);
              if (interestRateValue != null) {
                setInterestRateDraft(formatInterestRatePercent(interestRateValue));
              }
            }}
          />

          <span className="calc-label">%</span>
        </div>

        {/* adding £X each year */}
        <div className="calc-control-group">
          <span className="calc-label">adding</span>

          <button
            type="button"
            aria-label="Change currency"
            title="Tap to change currency"
            className="calc-currency-btn"
            onClick={() => moveCurrentCurrencySymbolIndex("forward")}
            onContextMenu={(event) => {
              event.preventDefault();
              moveCurrentCurrencySymbolIndex("backward");
            }}
          >
            {currency}
          </button>

          <input
            inputMode="decimal"
            enterKeyHint="done"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Yearly addition"
            size={Math.max(4, yearlyAdditionDisplay.length)}
            className={
              "calc-input calc-input-grow calc-input-grow-wide " +
              (yearlyAdditionValue == null || yearlyAdditionValue === 0
                ? "calc-input-muted"
                : "calc-input-active")
            }
            value={yearlyAdditionDisplay}
            onChange={handleYearlyAdditionChange}
            onFocus={(event) => {
              setYearlyAdditionFocused(true);
              setYearlyAdditionDraft(formatMoneyField(yearlyAdditionValue));
              selectAllOnFocus(event);
            }}
            onBlur={() => {
              setYearlyAdditionFocused(false);
              setYearlyAdditionDraft(formatMoneyField(yearlyAdditionValue));
            }}
          />

          <span className="calc-label">each year</span>
        </div>
      </section>

      <section
        aria-label="Growth chart"
        className={
          "relative flex-1 w-full min-h-[45vh] sm:min-h-[50vh] lg:min-h-0 transition-opacity duration-300 " +
          ((data || []).length <= 0 || !chartReady ? "opacity-0" : "opacity-100")
        }
        ref={chartContainerRef}
      >
        <div className="absolute inset-0">
          {chartReady && (
            <Suspense fallback={null}>
              <Chart data={data} currencySymbol={currency} />
            </Suspense>
          )}
        </div>
      </section>
    </main>
  );
}
