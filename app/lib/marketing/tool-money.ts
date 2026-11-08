// Money for the free planning tools (budget calculator, guest count planner):
// the currencies people can pick and how amounts are shown.

export const CURRENCIES = ['CAD', 'USD', 'EUR', 'GBP', 'AUD', 'MXN'] as const;
export type Currency = (typeof CURRENCIES)[number];

export function isCurrency(v: string): v is Currency {
  return (CURRENCIES as readonly string[]).includes(v);
}

// Canadian dollars unless the visitor picks another currency.
export const DEFAULT_CURRENCY: Currency = 'CAD';

export const CURRENCY_NAMES: Record<Currency, string> = {
  CAD: 'Canadian dollar',
  USD: 'US dollar',
  EUR: 'Euro',
  GBP: 'British pound',
  AUD: 'Australian dollar',
  MXN: 'Mexican peso',
};

// Shown the Canadian way: $ for Canadian dollars, US$, A$ and MX$ for the
// other dollars, so an amount in another dollar is never mistaken for CAD.
export function formatMoney(amount: number, currency: Currency): string {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Math.round(amount));
}

// The currency's symbol on its own, for the label in front of an input.
export function currencySymbol(currency: Currency): string {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency }).formatToParts(0).find((p) => p.type === 'currency')?.value ?? '$';
}
