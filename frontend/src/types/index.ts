/**
 * Frontend TypeScript interfaces mapping directly to backend schemas.
 */

export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  department: string;
  designation: string;
  country: string;
  city: string;
  gender: string;
  date_of_birth: string;
  date_of_joining: string;
  employment_type: string;
  status: "active" | "inactive";
  manager_id?: string | null;
  base_salary: number;
  base_salary_usd: number;
  currency: string;
  salary_effective_date: string;
  created_at: string;
  updated_at: string;
}

export interface SalaryRevision {
  id: string;
  employee_id: string;
  old_salary: number;
  new_salary: number;
  currency: string;
  effective_date: string;
  reason?: string;
  created_at: string;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  currency: string;
  payment_date: string;
  payment_method: string;
  status: string;
  created_at: string;
}

export interface Bonus {
  id: string;
  employee_id: string;
  amount: number;
  currency: string;
  bonus_type: string;
  date_awarded: string;
  reason?: string;
  created_at: string;
}

export interface Leave {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  status: string;
  created_at: string;
}

export interface Reimbursement {
  id: string;
  employee_id: string;
  amount: number;
  currency: string;
  category: string;
  date_submitted: string;
  status: string;
  created_at: string;
}

export interface EmployeeDetail extends Employee {
  salary_revisions: SalaryRevision[];
  payroll_records: PayrollRecord[];
  bonuses: Bonus[];
  leaves: Leave[];
  reimbursements: Reimbursement[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface EmployeeFilterParams {
  search?: string;
  department?: string;
  country?: string;
  status?: string;
  employment_type?: string;
  min_salary?: number;
  max_salary?: number;
  currency?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

export interface DashboardMetrics {
  total_employees: number;
  active_employees: number;
  total_departments: number;
  total_countries: number;
  total_payroll_usd: number;
  average_salary_usd: number;
  median_salary_usd: number;
  min_salary_usd: number;
  max_salary_usd: number;
  currency_breakdown: Record<string, number>;
}

export interface DepartmentStat {
  department: string;
  employee_count: number;
  total_salary_usd: number;
  average_salary_usd: number;
  min_salary_usd: number;
  max_salary_usd: number;
}

export interface CountryStat {
  country: string;
  employee_count: number;
  total_salary_usd: number;
  average_salary_usd: number;
  primary_currency: string;
}

export interface SalaryBucket {
  bucket: string;
  min_val: number;
  max_val: number | null;
  count: number;
}

export interface CSVImportResult {
  total_rows: number;
  imported: number;
  failed: number;
  errors: string[];
}
