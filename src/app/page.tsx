"use client";

// TODO: Move input box to a separate component

import Image from "next/image";
import { useRef, useState } from "react";

export default function Home() {

  const currencySymbols = ["£", "$", "€", "¥", "₹", "₽", "₿", "₺", "₴", "₩", "₮", "₦"];
  const [currentCurrencySymbolIndex, setCurrentCurrencySymbolIndex] = useState<number>(0);
  const moveCurrentCurrencySymbolIndex = (movement: 'forward' | 'backward') => {
    const nextIndex = movement === 'forward' ? currentCurrencySymbolIndex + 1 : currentCurrencySymbolIndex - 1;

    if (nextIndex < 0) setCurrentCurrencySymbolIndex(currencySymbols.length - 1);      
    else if (nextIndex >= currencySymbols.length) setCurrentCurrencySymbolIndex(0);      
    else setCurrentCurrencySymbolIndex(nextIndex);
  }

  const amountInputRef = useRef<HTMLInputElement>(null);

  const [amountValue, setAmountValue] = useState<number | null>(null);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value.replaceAll(',', ''));
    setAmountValue(value);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-row w-full">
        <div 
          className="flex flex-row w-7 text-4xl select-none cursor-pointer text-slate-500 hover:text-slate-400 transition-all"
          onClick={() => moveCurrentCurrencySymbolIndex('forward')}
          onContextMenu={() => moveCurrentCurrencySymbolIndex('backward')}
        >
          {currencySymbols[currentCurrencySymbolIndex]}
        </div>
        <input
          ref={amountInputRef}
          type="text"
          autoComplete="no"
          autoCapitalize="no"
          autoCorrect="no"
          autoFocus
          placeholder="0"
          className="px-4 flex-1 bg-transparent text-4xl border-none focus:outline-none transition-all placeholder-slate-500 text-slate-50"
          value={(amountValue ?? 0).toLocaleString()}
          onChange={handleAmountChange}
        />
      </div>
    </main>
  );
}
