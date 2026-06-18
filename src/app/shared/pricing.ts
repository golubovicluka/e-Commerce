export interface MonthlyPaymentOption {
  name: number;
}

export const MONTHLY_PAYMENT_OPTIONS: MonthlyPaymentOption[] = [
  { name: 12 },
  { name: 24 },
  { name: 36 },
];

export const DEFAULT_MONTHLY_PAYMENT = MONTHLY_PAYMENT_OPTIONS[0];

export function getInstallmentAmount(
  price: number | null | undefined,
  months: number
): number {
  if (!price || !months) {
    return 0;
  }
  return Math.floor(price / months);
}
