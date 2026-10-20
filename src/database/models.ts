/**
 * Domain Models and Types for CuentasClaras
 */

export interface Contact {
  id: string;
  fullName: string;
  phone: string;
  documentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type InterestType = 'DAILY_FIXED' | 'MONTHLY_FIXED' | 'SIMPLE';
export type LoanFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
export type LoanStatus = 'ACTIVE' | 'IN_ARREARS' | 'PAID';

export interface Loan {
  id: string;
  contactId: string;
  principalCOP: number;
  interestType: InterestType;
  interestRateBasisPoints: number;
  frequency: LoanFrequency;
  totalInstallments: number;
  startDate: string;
  dueDate: string;
  status: LoanStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type InstallmentStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export interface Installment {
  id: string;
  loanId: string;
  installmentNumber: number;
  dueDate: string;
  expectedAmountCOP: number;
  status: InstallmentStatus;
  paidAt?: string;
}

export type PaymentMethod = 'CASH' | 'NEQUI' | 'DAVIPLATA' | 'BANK_TRANSFER';

export interface Payment {
  id: string;
  loanId: string;
  amountPaidCOP: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}
