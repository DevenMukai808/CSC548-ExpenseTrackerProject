export enum TransactionType {
  EXPENSE = 'expense',
  INCOME = 'income'
}

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  type: TransactionType;
  description?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
}

export interface DashboardStats {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
}

export type ViewState = 'dashboard' | 'transactions' | 'budgets' | 'goals';
