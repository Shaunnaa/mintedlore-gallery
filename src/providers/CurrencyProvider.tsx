"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";

export type Currency = "SOL" | "USD" | "THB";

type CurrencyContextType = {
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  formatValue: (lamports: number | undefined | null) => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("SOL");
  const [rates, setRates] = useState<{ usd: number; thb: number } | null>(null);

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd,thb")
      .then((res) => res.json())
      .then((data) => {
        if (data.solana) {
          setRates({ usd: data.solana.usd, thb: data.solana.thb });
        }
      })
      .catch((err) => console.error("Failed to fetch CoinGecko rates:", err));
  }, []);

  const formatValue = (lamports: number | undefined | null): string => {
    if (lamports === undefined || lamports === null) return "--";
    
    const solValue = lamports / 1e9;
    
    if (selectedCurrency === "SOL" || !rates) {
      return `${solValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SOL`;
    }
    
    if (selectedCurrency === "USD") {
      return `$${(solValue * rates.usd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    if (selectedCurrency === "THB") {
      return `฿${(solValue * rates.thb).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    return "--";
  };

  return (
    <CurrencyContext.Provider value={{ selectedCurrency, setSelectedCurrency, formatValue }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrencyConverter() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrencyConverter must be used within a CurrencyProvider");
  }
  return context;
}
