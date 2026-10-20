/**
 * SQLite Database Schema and Initialization for CuentasClaras
 * Local-First, Offline-First with foreign keys and transactional integrity.
 */

export const CREATE_TABLES_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  document_id TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY NOT NULL,
  contact_id TEXT NOT NULL,
  principal_cop INTEGER NOT NULL,
  interest_type TEXT NOT NULL, -- 'DAILY_FIXED' | 'MONTHLY_FIXED' | 'SIMPLE'
  interest_rate_basis_points INTEGER NOT NULL, -- 2000 = 20.00%
  frequency TEXT NOT NULL, -- 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
  total_installments INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE' | 'IN_ARREARS' | 'PAID'
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS installments (
  id TEXT PRIMARY KEY NOT NULL,
  loan_id TEXT NOT NULL,
  installment_number INTEGER NOT NULL,
  due_date TEXT NOT NULL,
  expected_amount_cop INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'PAID' | 'OVERDUE'
  paid_at TEXT,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY NOT NULL,
  loan_id TEXT NOT NULL,
  amount_paid_cop INTEGER NOT NULL,
  payment_date TEXT NOT NULL,
  payment_method TEXT NOT NULL, -- 'CASH' | 'NEQUI' | 'DAVIPLATA' | 'BANK_TRANSFER'
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_loans_contact_id ON loans(contact_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_installments_loan_id ON installments(loan_id);
CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status);
`;
