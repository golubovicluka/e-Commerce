export interface MonthlyPaymentOption {
  name: number;
}

export const MONTHLY_PAYMENT_OPTIONS: MonthlyPaymentOption[] = [
  { name: 12 },
  { name: 24 },
  { name: 36 },
];

export const DEFAULT_MONTHLY_PAYMENT = MONTHLY_PAYMENT_OPTIONS[0];

export interface InstallmentPlan {
  months: number;
  regularPayment: number;
  finalPayment: number;
  total: number;
}

export function getInstallmentPlan(
  price: number | null | undefined,
  months: number,
): InstallmentPlan {
  if (
    typeof price !== 'number' ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !Number.isSafeInteger(months) ||
    months <= 0
  ) {
    return { months: 0, regularPayment: 0, finalPayment: 0, total: 0 };
  }

  const totalMinor = Math.round(price * 100);
  const regularPaymentMinor = Math.floor(totalMinor / months);
  const finalPaymentMinor = totalMinor - regularPaymentMinor * (months - 1);

  return {
    months,
    regularPayment: regularPaymentMinor / 100,
    finalPayment: finalPaymentMinor / 100,
    total: totalMinor / 100,
  };
}

export function getInstallmentAmount(
  price: number | null | undefined,
  months: number,
): number {
  return getInstallmentPlan(price, months).regularPayment;
}
