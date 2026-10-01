"use client";

import { useDebounce } from "@uidotdev/usehooks";
import { FocusEventHandler, Suspense, useEffect, useRef, useState } from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import Chart from "./Chart";
import {
  calculateCompoundInterest,
  formatInterestRatePercent,
  parseInterestRatePercent,
  parseMoneyInput,
  parseYearCount,
} from "../lib/calculateCompoundInterest";

export default function Home() {
  const currencySymbols = ["£", "$", "€", "¥", "₹", "₽", "₿", "₺", "₴", "₩", "₮", "₦"];
  const [currentCurrencySymbolIndex, setCurrentCurrencySymbolIndex] = useState<number>(0);
  const moveCurrentCurrencySymbolIndex = (movement: 'forward' | 'backward') => {
    const nextIndex = movement === 'forward' ? currentCurrencySymbolIndex + 1 : currentCurrencySymbolIndex - 1;

    if (nextIndex < 0) setCurrentCurrencySymbolIndex(currencySymbols.length - 1);      
    else if (nextIndex >= currencySymbols.length) setCurrentCurrencySymbolIndex(0);      
    else setCurrentCurrencySymbolIndex(nextIndex);
  }

  //

  const [amountValue, setAmountValue] = useState<number | null>(null);
  const debouncedAmountValue = useDebounce(amountValue, 250);

  const handleAmountChange = (event: ContentEditableEvent) => {
    if (event.target.value === '' || event.target.value == null) return setAmountValue(null);
    setAmountValue(parseMoneyInput(event.target.value));
  };

  //

  const [yearValue, setYearValue] = useState<number | null>(40);
  const debouncedYearValue = useDebounce(yearValue, 250);

  const handleYearChange = (event: ContentEditableEvent) => {
    if (event.target.value === '' || event.target.value == null) return setYearValue(null);
    setYearValue(parseYearCount(event.target.value));
  };

  //

  const [yearlyAdditionValue, setYearlyAdditionValue] = useState<number | null>(null);
  const debouncedYearlyAdditionValue = useDebounce(yearlyAdditionValue, 250);

  const handleYearlyAdditionChange = (event: ContentEditableEvent) => {
    if (event.target.value === '' || event.target.value == null) return setYearlyAdditionValue(null);
    setYearlyAdditionValue(parseMoneyInput(event.target.value));
  };

  //

  const [interestRateValue, setInterestRateValue] = useState<number|null>(0.07);
  const debouncedInterestRateValue = useDebounce(interestRateValue, 250);
  // Keep a raw string while editing so fractional rates like 7.5% are typeable
  // (controlled toFixed(0) previously rounded 7.5 → "8" and blocked decimals).
  const [interestRateDraft, setInterestRateDraft] = useState<string>(
    formatInterestRatePercent(0.07)
  );
  const [interestRateFocused, setInterestRateFocused] = useState(false);

  const handleInterestRateChange = (event: ContentEditableEvent) => {
    const raw = (event.target.value ?? '')
      .replaceAll('\n', '')
      .replaceAll('<br>', '')
      .replaceAll(' ', '');
    setInterestRateDraft(raw);

    if (raw === '' || raw === '.' || raw === '-' || raw === '-.') {
      setInterestRateValue(null);
      return;
    }

    setInterestRateValue(parseInterestRatePercent(raw));
  };

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

  const [chartContainerDimensions, setChartContainerDimensions] = useState<[number, number]>([0, 0]);
  const chartContainerPadding = 20;
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const handleChartContainerResize = () => {
    if (chartContainerRef.current == null) return;
    setChartContainerDimensions([
      (chartContainerRef.current?.parentElement?.clientWidth ?? 0) - (chartContainerPadding * 4),
      (chartContainerRef.current?.clientHeight ?? 0) - (chartContainerPadding),
    ]);
  };

  useEffect(() => {
    handleChartContainerResize();
    window.addEventListener('resize', handleChartContainerResize);

    return () => window.removeEventListener('resize', handleChartContainerResize);
  }, [chartContainerRef]);

  const focusContentEditable: FocusEventHandler<HTMLDivElement> = function (event) {
    const range = document.createRange();
    const selection = window.getSelection();
    const target = event.target as HTMLDivElement;

    if ((event.target?.innerHTML ?? '0') == '0') {
      range.selectNodeContents(target);
      selection?.removeAllRanges();
      selection?.addRange(range);

      return;
    }

    range.selectNodeContents(target);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  const interestRateDisplay = interestRateFocused
    ? interestRateDraft
    : formatInterestRatePercent(interestRateValue ?? 0);

  return (
    <main className="flex min-h-[150vh] lg:min-h-screen flex-col items-center justify-between px-20 pt-20 gap-10 select-none">

      <div className="flex flex-col lg:flex-row justify-center items-center w-full gap-6 text-2xl lg:text-3xl xl:text-4xl">

        <div className="flex flex-row justify-center items-center gap-2 flex-1">

          <div 
            className="flex flex-row w-5 select-none cursor-pointer text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 transition-all"
            onClick={() => moveCurrentCurrencySymbolIndex('forward')}
            onContextMenu={() => moveCurrentCurrencySymbolIndex('backward')}
          >
            {currencySymbols[currentCurrencySymbolIndex]}
          </div>

          <ContentEditable
            autoFocus
            className={"flex-1 bg-transparent outline-none rounded-lg border border-transparent hover:border-slate-400 focus:border-slate-500 active:border-slate-500 dark:border-black dark:hover:border-slate-600 dark:focus:border-slate-700 dark:active:border-slate-500 px-2 py-1 select-text transition-all " + (amountValue == null || amountValue === 0 ? 'text-slate-50 dark:text-slate-500' : 'text-slate-500 dark:text-slate-300')}
            html={(amountValue ?? '0').toLocaleString()}
            onChange={handleAmountChange}
            tagName="div"
            onFocus={focusContentEditable}
          />

        </div>

        <div className="flex flex-col lg:flex-row justify-center items-center gap-6">

          <div className="text-slate-400 dark:text-slate-500">
            for
          </div>

          <ContentEditable
            html={yearValue?.toString() ?? ''}
            className={"flex-1 bg-transparent outline-none rounded-lg border border-transparent hover:border-slate-400 focus:border-slate-500 active:border-slate-500 dark:border-black dark:hover:border-slate-600 dark:focus:border-slate-700 dark:active:border-slate-500 px-2 py-1 select-text transition-all " + (yearValue == null || yearValue === 0 ? 'text-slate-50 dark:text-slate-500' : 'text-slate-500 dark:text-slate-300')}
            onChange={handleYearChange}
            tagName='div'
            onFocus={focusContentEditable}
          />

          <div className="text-slate-400 dark:text-slate-500">
            years at
          </div>

          <div className="flex flex-row justify-center items-center gap-2">

            <ContentEditable
              html={interestRateDisplay}
              className={"flex-1 bg-transparent outline-none rounded-lg border border-transparent hover:border-slate-400 focus:border-slate-500 active:border-slate-500 dark:border-black dark:hover:border-slate-600 dark:focus:border-slate-700 dark:active:border-slate-500 px-2 py-1 select-text transition-all " + (interestRateValue == null || interestRateValue === 0 ? 'text-slate-50 dark:text-slate-500' : 'text-slate-500 dark:text-slate-300')}
              onChange={handleInterestRateChange}
              tagName='div'
              onFocus={(event) => {
                setInterestRateFocused(true);
                setInterestRateDraft(formatInterestRatePercent(interestRateValue ?? 0));
                focusContentEditable(event);
              }}
              onBlur={() => {
                setInterestRateFocused(false);
                if (interestRateValue != null) {
                  setInterestRateDraft(formatInterestRatePercent(interestRateValue));
                }
              }}
            />

            <div className="text-slate-400 dark:text-slate-500">
              %,
            </div>

          </div>

          <div className="text-slate-400 dark:text-slate-500">
            adding
          </div>

          <div className="flex flex-row justify-center items-center gap-2">

            <div 
              className="flex flex-row w-5 select-none cursor-pointer text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 transition-all"
              onClick={() => moveCurrentCurrencySymbolIndex('forward')}
              onContextMenu={() => moveCurrentCurrencySymbolIndex('backward')}
            >
              {currencySymbols[currentCurrencySymbolIndex]}
            </div>

            <ContentEditable
              html={(yearlyAdditionValue ?? '0').toLocaleString()}
              className={"flex-1 bg-transparent outline-none rounded-lg border border-transparent hover:border-slate-400 focus:border-slate-500 active:border-slate-500 dark:border-black dark:hover:border-slate-600 dark:focus:border-slate-700 dark:active:border-slate-500 px-2 py-1 select-text transition-all " + (yearlyAdditionValue == null || yearlyAdditionValue === 0 ? 'text-slate-50 dark:text-slate-500' : 'text-slate-500 dark:text-slate-300')}
              onChange={handleYearlyAdditionChange}
              tagName='div'
              onFocus={focusContentEditable}
            />

          </div>

          <div className="text-slate-400 dark:text-slate-500">
            each year
          </div>

        </div>

      </div>

      <div className={"block flex-1 transition-opacity duration-300 " + ((data || []).length <= 0 ? 'opacity-0' : 'opacity-100')} ref={chartContainerRef}>

        <div>

          <Suspense>
            <Chart
              width={chartContainerDimensions[0]}
              height={chartContainerDimensions[1]}
              data={data}
              currencySymbol={currencySymbols[currentCurrencySymbolIndex]}
            />
          </Suspense>

        </div>

      </div>

    </main>
  );
}
