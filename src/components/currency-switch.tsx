'use client';

import { useCurrencyStore } from '@/stores/currency';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign } from 'lucide-react';

export function CurrencySwitch() {
  const { currency, setCurrency } = useCurrencyStore();

  return (
    <div className="flex items-center space-x-2">
      <DollarSign className="h-4 w-4 text-gray-500" />
      <Select value={currency} onValueChange={setCurrency}>
        <SelectTrigger className="w-20 h-8 text-sm border-gray-300">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="USD">USD</SelectItem>
          <SelectItem value="AED">AED</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}