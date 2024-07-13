"use client";

import { useAsyncMemo } from "use-async-memo";
import { useDebounce } from "@uidotdev/usehooks";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import Chart from "./Chart";

export default function Home() {

  //

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

    const value = parseFloat(event.target.value.replaceAll(',', ''));
    setAmountValue(value);
  };

  //

  const [yearValue, setYearValue] = useState<number | null>(40);
  const debouncedYearValue = useDebounce(yearValue, 250);

  const handleYearChange = (event: ContentEditableEvent) => {
    if (event.target.value === '' || event.target.value == null) return setYearValue(null);

    // So many operations multiplying exponential numbers causes the browser to crash over 4 digits
    if (event.target.value.length > 4) return setYearValue(9999);

    const value = parseFloat(event.target.value);
    setYearValue(value);
  };

  //

  const [yearlyAdditionValue, setYearlyAdditionValue] = useState<number | null>(null);
  const debouncedYearlyAdditionValue = useDebounce(yearlyAdditionValue, 250);

  const handleYearlyAdditionChange = (event: ContentEditableEvent) => {
    if (event.target.value === '' || event.target.value == null) return setYearlyAdditionValue(null);

    // // So many operations multiplying exponential numbers causes the browser to crash over 4 digits
    // if (event.target.value.length > 4) return setYearlyAdditionValue(9999);

    const value = parseFloat(event.target.value.replaceAll(',', ''));
    setYearlyAdditionValue(value);
  };

  //

  const [interestRate, setInterestRate] = useState<number>(0.07);

  //

  const data: CompountChartDataType = useAsyncMemo<CompountChartDataType>(
    async () => new Promise(resolve => {
      if (debouncedAmountValue == null || debouncedYearValue == null) return resolve([]);

      const result: CompountChartDataType = [];

      let amount = debouncedAmountValue; 
      const currentYear = new Date().getFullYear();

      for (let yearIndex = 0; yearIndex < (debouncedYearValue + 1); yearIndex++) {
        result.push({
          year: (yearIndex + currentYear).toString(),
          yAxisValue: amount,
          amountOfMoney: amount,
        });

        /**
         * TODO: There is an issue here, I am not sure which formula is correct
         *   Should the yearly addition be added before or after the interest rate is applied?
         */

        // amount = (amount * (1 + interestRate)) + (debouncedYearlyAdditionValue ?? 0);        
        amount = ((amount + (debouncedYearlyAdditionValue ?? 0)) * (1 + interestRate));        
      }

      resolve(result);
    }), 
    [
      debouncedAmountValue,
      debouncedYearValue,
      debouncedYearlyAdditionValue,
      interestRate,
    ],
    []
  );

  //

  const [chartContainerDimensions, setChartContainerDimensions] = useState<[number, number]>([0, 0]);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const handleChartContainerResize = () => {
    if (chartContainerRef.current == null) return;
    setChartContainerDimensions([
      chartContainerRef.current?.parentElement?.clientWidth ?? 0,
      chartContainerRef.current.clientHeight,
    ]);
  };

  useEffect(() => {
    handleChartContainerResize();
    window.addEventListener('resize', handleChartContainerResize);

    return () => window.removeEventListener('resize', handleChartContainerResize);
  }, [chartContainerRef]);

  //



  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-20 pt-20 gap-10">

      <div className="flex flex-row justify-center items-center w-full gap-6 text-4xl">

        <div className="flex flex-row justify-center items-center gap-2 flex-1">

          <div 
            className="flex flex-row w-5 select-none cursor-pointer text-slate-500 hover:text-slate-400 transition-all"
            onClick={() => moveCurrentCurrencySymbolIndex('forward')}
            onContextMenu={() => moveCurrentCurrencySymbolIndex('backward')}
          >
            {currencySymbols[currentCurrencySymbolIndex]}
          </div>

          <ContentEditable
            autoFocus
            className={"flex-1 bg-transparent outline-none rounded-lg border border-black hover:border-slate-600 focus:border-slate-700 active:border-slate-500 px-2 py-1 transition-all " + (amountValue == null || amountValue === 0 ? 'text-slate-500' : 'text-slate-50')}
            html={(amountValue ?? '0').toLocaleString()}
            onChange={handleAmountChange}
            tagName="div"
          />

        </div>

        <div className="flex flex-row justify-center items-center gap-6">

          <div className="text-slate-500">
            for
          </div>

          <ContentEditable
            html={yearValue?.toString() ?? ''}
            className={"flex-1 bg-transparent outline-none rounded-lg border border-black hover:border-slate-600 focus:border-slate-700 active:border-slate-500 px-2 py-1 transition-all " + (yearValue == null || yearValue === 0 ? 'text-slate-500' : 'text-slate-50')}
            onChange={handleYearChange}
            tagName='div'
          />

          <div className="text-slate-500">
            years, adding
          </div>

          <div className="flex flex-row justify-center items-center gap-2">

            <div 
              className="flex flex-row w-5 select-none cursor-pointer text-slate-500 hover:text-slate-400 transition-all"
              onClick={() => moveCurrentCurrencySymbolIndex('forward')}
              onContextMenu={() => moveCurrentCurrencySymbolIndex('backward')}
            >
              {currencySymbols[currentCurrencySymbolIndex]}
            </div>

            <ContentEditable
              html={(yearlyAdditionValue ?? '0').toLocaleString()}
              className={"flex-1 bg-transparent outline-none rounded-lg border border-black hover:border-slate-600 focus:border-slate-700 active:border-slate-500 px-2 py-1 transition-all " + (yearlyAdditionValue == null || yearlyAdditionValue === 0 ? 'text-slate-500' : 'text-slate-50')}
              onChange={handleYearlyAdditionChange}
              tagName='div'
            />

          </div>

          <div className="text-slate-500">
            each year
          </div>

        </div>

      </div>

      <div className={"block flex-1 " + ((data || []).length <= 0 ? 'invisible' : '')} ref={chartContainerRef}>

        <Suspense>
          <Chart
            width={chartContainerDimensions[0]}
            height={chartContainerDimensions[1]}
            data={data}
            currencySymbol={currencySymbols[currentCurrencySymbolIndex]}
          />
        </Suspense>

      </div>

    </main>
  );
}
