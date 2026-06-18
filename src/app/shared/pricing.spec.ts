import {
  DEFAULT_MONTHLY_PAYMENT,
  getInstallmentAmount,
  MONTHLY_PAYMENT_OPTIONS,
} from './pricing';

describe('pricing', () => {
  it('exposes standard installment month options', () => {
    expect(MONTHLY_PAYMENT_OPTIONS.map((o) => o.name)).toEqual([12, 24, 36]);
    expect(DEFAULT_MONTHLY_PAYMENT.name).toBe(12);
  });

  it('getInstallmentAmount floors price / months', () => {
    expect(getInstallmentAmount(1200, 12)).toBe(100);
    expect(getInstallmentAmount(1000, 36)).toBe(27);
    expect(getInstallmentAmount(1000, 24)).toBe(41);
    expect(getInstallmentAmount(0, 12)).toBe(0);
    expect(getInstallmentAmount(null, 12)).toBe(0);
  });
});
