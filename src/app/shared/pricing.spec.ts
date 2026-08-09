import {
  DEFAULT_MONTHLY_PAYMENT,
  getInstallmentAmount,
  getInstallmentPlan,
  MONTHLY_PAYMENT_OPTIONS,
} from './pricing';

describe('pricing', () => {
  it('exposes standard installment month options', () => {
    expect(MONTHLY_PAYMENT_OPTIONS.map((o) => o.name)).toEqual([12, 24, 36]);
    expect(DEFAULT_MONTHLY_PAYMENT.name).toBe(12);
  });

  it('calculates exact installment plans in minor currency units', () => {
    expect(getInstallmentPlan(1000, 24)).toEqual({
      months: 24,
      regularPayment: 41.66,
      finalPayment: 41.82,
      total: 1000,
    });
  });

  it('keeps the compatibility amount as the regular payment', () => {
    expect(getInstallmentAmount(1200, 12)).toBe(100);
    expect(getInstallmentAmount(1000, 36)).toBe(27.77);
    expect(getInstallmentAmount(1000, 24)).toBe(41.66);
  });

  it.each([
    [0, 12],
    [-1, 12],
    [Number.NaN, 12],
    [Number.POSITIVE_INFINITY, 12],
    [null, 12],
    [1000, 0],
    [1000, -1],
    [1000, 1.5],
  ])('returns an empty plan for invalid input: %p over %p months', (price, months) => {
    expect(getInstallmentPlan(price, months)).toEqual({
      months: 0,
      regularPayment: 0,
      finalPayment: 0,
      total: 0,
    });
  });
});
