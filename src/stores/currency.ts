'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = 'USD' | 'AED' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD' | 'JPY' | 'CHF' | 'CNY';

interface CurrencyState {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number) => string;
  formatAmount: (amount: number, baseCurrency?: Currency) => string;
  convertCurrency: (amount: number, from: Currency, to: Currency) => number;
}

// Exchange rates relative to USD (as of November 2025 - these should be updated regularly)
const EXCHANGE_RATES = {
  // Base currency is USD
  USD: 1.0,
  
  // Middle East
  AED: 3.67,
  
  // Europe
  EUR: 0.85,
  GBP: 0.73,
  CHF: 0.83,
  
  // Asia
  INR: 84.5,
  JPY: 152.0,
  CNY: 7.25,
  
  // Americas
  CAD: 1.38,
  
  // Oceania
  AUD: 1.52,
};

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'AED',

      setCurrency: (currency: Currency) => {
        set({ currency });
      },

      formatCurrency: (amount: number) => {
        const { currency } = get();
        const formattedAmount = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);

        return formattedAmount;
      },

      formatAmount: (amount: number, baseCurrency: Currency = 'USD') => {
        const { currency, convertCurrency } = get();
        const convertedAmount = convertCurrency(amount, baseCurrency, currency);
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(convertedAmount);
      },

      convertCurrency: (amount: number, from: Currency, to: Currency) => {
        if (from === to) return amount;

        // Convert to USD first, then to target currency
        const amountInUSD = from === 'USD' ? amount : amount / EXCHANGE_RATES[from];
        const amountInTarget = to === 'USD' ? amountInUSD : amountInUSD * EXCHANGE_RATES[to];

        return amountInTarget;
      },
    }),
    {
      name: 'currency-storage',
    }
  )
);