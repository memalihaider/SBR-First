'use client';

import { useCurrencyStore } from '@/stores/currency';
import { Button } from '@/components/ui/button';

export function SalesCurrencySwitcher() {
  const { currency, setCurrency } = useCurrencyStore();

  const handleCurrencyChange = (newCurrency: 'USD' | 'AED') => {
    setCurrency(newCurrency);
  };

  return (
    <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-300 p-1 shadow-sm">
      <Button
        variant={currency === 'USD' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleCurrencyChange('USD')}
        className={`px-3 py-1 text-xs font-medium transition-all duration-200 ${
          currency === 'USD'
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 bg-white'
        }`}
      >
        USD
      </Button>
      <Button
        variant={currency === 'AED' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleCurrencyChange('AED')}
        className={`px-3 py-1 text-xs font-medium transition-all duration-200 ${
          currency === 'AED'
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 bg-white'
        }`}
      >
        AED
      </Button>
    </div>
  );
}