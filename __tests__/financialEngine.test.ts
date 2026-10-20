import {
  calculateDailyFixedLoan,
  calculateMonthlyFixedInterestLoan,
  calculateSimpleInterestLoan,
  formatCOP,
} from '../src/core/financialEngine';

describe('Financial Engine (COP Lending Rules)', () => {
  describe('formatCOP', () => {
    it('formats Colombian Pesos without decimals correctly', () => {
      const formatted = formatCOP(1500000);
      // In Colombian locale: $ 1.500.000 or $1.500.000
      expect(formatted).toMatch(/1\.500\.000/);
    });
  });

  describe('calculateDailyFixedLoan (Gota a Gota / Cobro Diario)', () => {
    it('correctly calculates total due and daily installment for 20 days at 20%', () => {
      // Principal: $1.000.000 COP, Rate: 2000 basis points (20%), Installments: 20
      const plan = calculateDailyFixedLoan({
        principalCOP: 1000000,
        rateBasisPoints: 2000,
        days: 20,
        startDate: new Date('2026-10-20'),
      });

      expect(plan.totalInterestCOP).toBe(200000);
      expect(plan.totalDueCOP).toBe(1200000);
      expect(plan.installmentAmountCOP).toBe(60000);
      expect(plan.installments).toHaveLength(20);
      expect(plan.installments[0].installmentNumber).toBe(1);
      expect(plan.installments[0].amountCOP).toBe(60000);
    });
  });

  describe('calculateMonthlyFixedInterestLoan (Interés mensual sobre saldo)', () => {
    it('calculates monthly interest fee correctly (e.g., 5% monthly on $2.000.000)', () => {
      const result = calculateMonthlyFixedInterestLoan({
        principalCOP: 2000000,
        monthlyRateBasisPoints: 500, // 5.00%
      });

      expect(result.monthlyInterestFeeCOP).toBe(100000);
    });
  });

  describe('calculateSimpleInterestLoan', () => {
    it('calculates exact interest for specific days elapsed', () => {
      // $1.000.000 COP at 10% annual (1000 bps) for 36 days (standard 360-day commercial year)
      const interest = calculateSimpleInterestLoan({
        principalCOP: 1000000,
        annualRateBasisPoints: 1000,
        daysElapsed: 36,
      });

      // (1000000 * 0.10 * 36) / 360 = 10000
      expect(interest).toBe(10000);
    });
  });
});
