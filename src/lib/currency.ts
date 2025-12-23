import { useCurrencyStore } from '@/stores/currency';

export const useCurrency = () => {
  const { currency, formatAmount, convertCurrency } = useCurrencyStore();

  return {
    currency,
    formatAmount,
    convertCurrency,
  };
};

export const formatPrice = (amount: number, currency: 'USD' | 'AED' = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const convertPrice = (amount: number, from: 'USD' | 'AED', to: 'USD' | 'AED') => {
  const EXCHANGE_RATES = {
    USD_TO_AED: 3.67,
    AED_TO_USD: 1 / 3.67,
  };

  if (from === to) return amount;

  if (from === 'USD' && to === 'AED') {
    return amount * EXCHANGE_RATES.USD_TO_AED;
  } else if (from === 'AED' && to === 'USD') {
    return amount * EXCHANGE_RATES.AED_TO_USD;
  }

  return amount;
};