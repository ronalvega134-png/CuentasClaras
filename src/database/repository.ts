import { Contact, Loan, Installment } from './models';
import { calculateDailyFixedLoan } from '../core/financialEngine';

export interface IDatabaseDriver {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: any[]): Promise<{ lastInsertRowId?: number; changes?: number }>;
  getAllAsync<T = any>(sql: string, params?: any[]): Promise<T[]>;
  getFirstAsync<T = any>(sql: string, params?: any[]): Promise<T | null>;
  withTransactionAsync<T>(callback: () => Promise<T>): Promise<T>;
}

export interface LoanWithBorrower {
  loan: Loan;
  borrowerName: string;
  borrowerPhone: string;
  totalDueCOP: number;
  pendingAmountCOP: number;
}

export class LoanRepository {
  constructor(private db: IDatabaseDriver) {}

  async createContact(params: {
    id: string;
    fullName: string;
    phone: string;
    documentId?: string;
    notes?: string;
  }): Promise<Contact> {
    const now = new Date().toISOString();
    await this.db.runAsync(
      `INSERT INTO contacts (id, full_name, phone, document_id, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [params.id, params.fullName, params.phone, params.documentId || null, params.notes || null, now, now]
    );

    return {
      id: params.id,
      fullName: params.fullName,
      phone: params.phone,
      documentId: params.documentId,
      notes: params.notes,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getAllContacts(): Promise<Contact[]> {
    const rows = await this.db.getAllAsync<{
      id: string;
      full_name: string;
      phone: string;
      document_id: string | null;
      notes: string | null;
      created_at: string;
      updated_at: string;
    }>(`SELECT * FROM contacts ORDER BY full_name ASC`);

    return rows.map((r) => ({
      id: r.id,
      fullName: r.full_name,
      phone: r.phone,
      documentId: r.document_id || undefined,
      notes: r.notes || undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  async createDailyLoan(params: {
    loanId: string;
    contactId: string;
    principalCOP: number;
    rateBasisPoints: number;
    days: number;
    startDate: Date;
    notes?: string;
  }): Promise<{ loan: Loan; installments: Installment[] }> {
    const schedule = calculateDailyFixedLoan({
      principalCOP: params.principalCOP,
      rateBasisPoints: params.rateBasisPoints,
      days: params.days,
      startDate: params.startDate,
    });

    const now = new Date().toISOString();
    const dueDate = schedule.installments[schedule.installments.length - 1].dueDate;

    return await this.db.withTransactionAsync(async () => {
      // 1. Insert Loan
      await this.db.runAsync(
        `INSERT INTO loans (
          id, contact_id, principal_cop, interest_type, interest_rate_basis_points,
          frequency, total_installments, start_date, due_date, status, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          params.loanId,
          params.contactId,
          params.principalCOP,
          'DAILY_FIXED',
          params.rateBasisPoints,
          'DAILY',
          params.days,
          params.startDate.toISOString().split('T')[0],
          dueDate,
          'ACTIVE',
          params.notes || null,
          now,
          now,
        ]
      );

      // 2. Insert Installments
      const createdInstallments: Installment[] = [];
      for (const item of schedule.installments) {
        const installmentId = `${params.loanId}_inst_${item.installmentNumber}`;
        await this.db.runAsync(
          `INSERT INTO installments (id, loan_id, installment_number, due_date, expected_amount_cop, status)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [installmentId, params.loanId, item.installmentNumber, item.dueDate, item.amountCOP, 'PENDING']
        );
        createdInstallments.push({
          id: installmentId,
          loanId: params.loanId,
          installmentNumber: item.installmentNumber,
          dueDate: item.dueDate,
          expectedAmountCOP: item.amountCOP,
          status: 'PENDING',
        });
      }

      const createdLoan: Loan = {
        id: params.loanId,
        contactId: params.contactId,
        principalCOP: params.principalCOP,
        interestType: 'DAILY_FIXED',
        interestRateBasisPoints: params.rateBasisPoints,
        frequency: 'DAILY',
        totalInstallments: params.days,
        startDate: params.startDate.toISOString().split('T')[0],
        dueDate,
        status: 'ACTIVE',
        notes: params.notes,
        createdAt: now,
        updatedAt: now,
      };

      return { loan: createdLoan, installments: createdInstallments };
    });
  }

  async getAllLoansWithBorrower(): Promise<LoanWithBorrower[]> {
    const rows = await this.db.getAllAsync<{
      id: string;
      contact_id: string;
      principal_cop: number;
      interest_type: string;
      interest_rate_basis_points: number;
      frequency: string;
      total_installments: number;
      start_date: string;
      due_date: string;
      status: string;
      notes: string | null;
      created_at: string;
      updated_at: string;
      full_name: string;
      phone: string;
    }>(
      `SELECT l.*, c.full_name, c.phone
       FROM loans l
       JOIN contacts c ON l.contact_id = c.id
       ORDER BY l.created_at DESC`
    );

    const result: LoanWithBorrower[] = [];
    for (const r of rows) {
      // Calculate pending installments balance
      const installments = await this.db.getAllAsync<{ expected_amount_cop: number }>(
        `SELECT expected_amount_cop FROM installments WHERE loan_id = ? AND status = 'PENDING'`,
        [r.id]
      );
      const pendingAmount = installments.reduce((acc, curr) => acc + curr.expected_amount_cop, 0);

      const allInstallments = await this.db.getAllAsync<{ expected_amount_cop: number }>(
        `SELECT expected_amount_cop FROM installments WHERE loan_id = ?`,
        [r.id]
      );
      const totalDue = allInstallments.reduce((acc, curr) => acc + curr.expected_amount_cop, 0);

      result.push({
        loan: {
          id: r.id,
          contactId: r.contact_id,
          principalCOP: r.principal_cop,
          interestType: r.interest_type as any,
          interestRateBasisPoints: r.interest_rate_basis_points,
          frequency: r.frequency as any,
          totalInstallments: r.total_installments,
          startDate: r.start_date,
          dueDate: r.due_date,
          status: r.status as any,
          notes: r.notes || undefined,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        },
        borrowerName: r.full_name,
        borrowerPhone: r.phone,
        totalDueCOP: totalDue,
        pendingAmountCOP: pendingAmount,
      });
    }

    return result;
  }
}
