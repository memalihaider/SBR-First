'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCurrencyStore } from '@/stores/currency';
import { Currency } from '@/stores/currency';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  AED: 'د.إ',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  CHF: 'CHF',
  CNY: '¥',
};

const CURRENCY_NAMES: Record<Currency, string> = {
  USD: 'US Dollar',
  AED: 'UAE Dirham',
  EUR: 'Euro',
  GBP: 'British Pound',
  INR: 'Indian Rupee',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  JPY: 'Japanese Yen',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
};

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrencyStore();

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
          <span className="font-medium">{CURRENCY_SYMBOLS[currency]}</span>
          <span className="hidden sm:inline">{currency}</span>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-300 shadow-lg">
        {Object.entries(CURRENCY_NAMES).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleCurrencyChange(code as Currency)}
            className={`flex items-center gap-3 cursor-pointer ${
              currency === code 
                ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500' 
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <span className="font-medium text-lg">{CURRENCY_SYMBOLS[code as Currency]}</span>
            <div className="flex flex-col">
              <span className="font-medium">{code}</span>
              <span className="text-xs text-gray-500">{name}</span>
            </div>
            {currency === code && (
              <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}