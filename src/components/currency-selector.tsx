'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Coins } from 'lucide-react';
import { useCurrencyStore } from '@/stores/currency';
import type { Currency } from '@/stores/currency';

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrencyStore();

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-300 px-3 py-2 shadow-sm">
        <div className="flex items-center space-x-2">
          {currency === 'USD' ? (
            <DollarSign className="h-4 w-4 text-blue-600" />
          ) : (
            <Coins className="h-4 w-4 text-green-600" />
          )}
          <Select value={currency} onValueChange={handleCurrencyChange}>
            <SelectTrigger className="w-20 bg-white border-gray-300 text-gray-900 hover:bg-gray-50 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300">
              <SelectItem value="USD" className="hover:bg-blue-50 focus:bg-blue-50">USD</SelectItem>
              <SelectItem value="AED" className="hover:bg-green-50 focus:bg-green-50">AED</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}