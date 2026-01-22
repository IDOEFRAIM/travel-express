// Simple currency conversion service
// You can extend this with real API rates (ex: fixer.io, openexchangerates.org)

const RATES = {
  XOF: 1,
  EUR: 655.957, // 1 EUR = 655.957 XOF
  USD: 600,      // Example rate, update as needed
  // Add more currencies as needed
};

type Currency = keyof typeof RATES;

export function convertToXOF(amount: number, currency: Currency): number {
  const rate = RATES[currency] || 1;
  return Math.round(amount * rate);
}

export function formatCurrency(amount: number, currency: string): string {
  return `${amount} ${currency}`;
}

// Usage example:
// convertToXOF(100, 'EUR') // returns 65595
// convertToXOF(50, 'USD')  // returns 30000
