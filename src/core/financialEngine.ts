/**
 * Core Financial Engine for CuentasClaras (COP Lending)
 * Strict integer calculations to avoid IEEE 754 floating-point rounding errors.
 */

export interface DailyFixedLoanParams {
  principalCOP: number;
  rateBasisPoints: number; // e.g., 2000 for 20.00%
  days: number;
  startDate: Date;
}

export interface InstallmentScheduleItem {
  installmentNumber: number;
  dueDate: string; // ISO date format YYYY-MM-DD
  amountCOP: number;
}

export interface DailyFixedLoanResult {
  principalCOP: number;
  totalInterestCOP: number;
  totalDueCOP: number;
  installmentAmountCOP: number;
  installments: InstallmentScheduleItem[];
}

export interface MonthlyFixedInterestParams {
  principalCOP: number;
  monthlyRateBasisPoints: number; // e.g., 500 for 5.00%
}

export interface MonthlyFixedInterestResult {
  monthlyInterestFeeCOP: number;
}

export interface SimpleInterestParams {
  principalCOP: number;
  annualRateBasisPoints: number; // e.g., 1000 for 10.00%
  daysElapsed: number;
  commercialYearDays?: number; // Standard 360 days in Colombian commercial banking
}

/**
 * Formats a monetary amount into Colombian Pesos (COP) without decimals.
 */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(amount));
}

/**
 * Calculates a fixed daily installment loan (widely known in Colombia as "gota a gota" or pago diario).
 * Total interest is calculated upfront as: Principal * (Rate / 100).
 * Total due = Principal + Total Interest.
 * Installment amount = Total Due / Days.
 */
export function calculateDailyFixedLoan(params: DailyFixedLoanParams): DailyFixedLoanResult {
  const { principalCOP, rateBasisPoints, days, startDate } = params;
  if (days <= 0) throw new Error('Days must be greater than zero');
  if (principalCOP <= 0) throw new Error('Principal must be greater than zero');

  // Math.round keeps integer cents/pesos
  const totalInterestCOP = Math.round((principalCOP * rateBasisPoints) / 10000);
  const totalDueCOP = principalCOP + totalInterestCOP;
  const installmentAmountCOP = Math.round(totalDueCOP / days);

  const installments: InstallmentScheduleItem[] = [];
  for (let i = 1; i <= days; i++) {
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + i);
    installments.push({
      installmentNumber: i,
      dueDate: dueDate.toISOString().split('T')[0],
      amountCOP: installmentAmountCOP,
    });
  }

  return {
    principalCOP,
    totalInterestCOP,
    totalDueCOP,
    installmentAmountCOP,
    installments,
  };
}

/**
 * Calculates a monthly fixed interest fee over active principal (common informal loan with monthly interest payment).
 */
export function calculateMonthlyFixedInterestLoan(
  params: MonthlyFixedInterestParams
): MonthlyFixedInterestResult {
  const { principalCOP, monthlyRateBasisPoints } = params;
  const monthlyInterestFeeCOP = Math.round((principalCOP * monthlyRateBasisPoints) / 10000);
  return { monthlyInterestFeeCOP };
}

/**
 * Calculates simple interest for an exact number of days elapsed.
 * Formula: (Principal * (annualRate / 10000) * daysElapsed) / commercialYearDays
 */
export function calculateSimpleInterestLoan(params: SimpleInterestParams): number {
  const { principalCOP, annualRateBasisPoints, daysElapsed, commercialYearDays = 360 } = params;
  const interest = (principalCOP * annualRateBasisPoints * daysElapsed) / (10000 * commercialYearDays);
  return Math.round(interest);
}
