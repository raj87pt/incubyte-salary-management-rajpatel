# Requirements Document: Employee Salary Management System

## 1. Goal

Build a web-based salary management tool that replaces ACME org's error-prone Excel workflows. It lets the HR Manager manage salary data for 10,000 employees across multiple countries and answer compensation questions instantly.

## 2. User Persona

**HR Manager.** Needs to view, edit and analyze salary data across departments and geographies. Not technical; expects an intuitive interface with fast search and clear analytics. Currently spends hours wrestling with spreadsheets.

## 3. Definitions

| Term | Definition |
|---|---|
| **Base salary** | An employee's current annual salary in their local currency, stored in minor units. |
| **Normalized salary** | Base salary converted to USD using the static exchange rate for the employee's currency. |
| **Total payroll** | Sum of normalized base salaries of employees with status `active`. |
| **Employment type** | One of `full_time`, `part_time`, `contract`. |
| **Status** | One of `active`, `inactive`. Deleting an employee sets status to `inactive` (soft delete); records are never physically removed in normal use. |
| **Salary revision** | A record of one base-salary change: old value, new value, reason, effective date. |

## 4. Scope and Features

### 4.1 Core: Employee Management

- **FR-1 CRUD.** Add, view, edit and delete (soft delete) employee records.
- **FR-2 Searchable list.** A paginated table over 10K records with sorting and filtering by name, department, country, salary range, employment type and status. Name search is a case-insensitive substring match.
- **FR-3 Validation.** Email must be unique and well-formed. `employee_id` must be unique. Base salary must be greater than zero. Currency must be a supported currency code. Manager, when set, must be an existing employee other than the employee themselves. Validation errors are shown next to the offending field.
- **FR-4 CSV import.** Bulk upload employees from a CSV file.
  - Required columns: `employee_id`, `name`, `email`, `department`, `country`, `employment_type`, `status`, `currency`, `base_salary`. Optional: `manager_employee_id`.
  - Each row is validated with the same rules as FR-3.
  - Invalid rows and duplicates (by `employee_id` or `email`) are skipped and reported with row number and reason. They never abort the import and never overwrite existing records.
  - The result shows counts of inserted, skipped and errored rows.
- **FR-5 CSV export.** Export employees as CSV in the same column format as import. Export respects the active filters, with an option to export all records.
- **FR-6 Multi-currency.** Show salaries in the employee's local currency alongside the USD-normalized value.
  - Exchange rates are static and stored in the database (one rate per currency to USD), loaded from seed data and editable only by changing that data.
  - Normalized values are rounded to 2 decimal places at display time, not stored.

### 4.2 Core: Salary Analytics

- **FR-7 Dashboard.** KPI cards for total payroll (USD), headcount (active employees), and average normalized salary, plus breakdowns by department and by country.
- **FR-8 Visualizations.** Bar and pie charts for salary distribution, department spend and geographic breakdown. All aggregation is computed server-side.
- **FR-9 Salary revision history.** Every change to an employee's base salary creates a revision record (old value, new value, reason, effective date). The edit form asks for a reason when the salary changes. Revisions are append-only and shown per employee. The system does not record who made the change, because there is no authentication (see Section 5).

### 4.3 Read-Only: Supporting Data

- **FR-10 Payroll records.** Monthly payroll summaries per employee (seeded, not calculated).
- **FR-11 Bonuses.** Bonus history with type and reason.
- **FR-12 Leaves.** Leave records with type, dates and approval status.
- **FR-13 Reimbursements.** Reimbursement claims with category and status.

These are displayed for reference and are **not editable**. The HR Manager views them but does not manage payroll processing through this tool. They are populated by the seed script.

### 4.4 Data Seeding

- **FR-14 Seed script.** A single command generates a realistic dataset: 10,000 employees across multiple countries and departments, with their salary revisions, payroll records, bonuses, leaves and reimbursements, plus the exchange-rate table. The script is repeatable and produces the same dataset when run with the same seed.

## 5. Deliberately Excluded

| Feature | Reason |
|---|---|
| **Authentication and RBAC** | Single-user HR tool for this scope. A production version would add OAuth and role-based access. Consequence: revision history cannot record who made a change. |
| **Tax calculations** | Jurisdiction-dependent complexity (10+ countries). Would require a dedicated tax engine. |
| **Payroll processing engine** | Calculating net pay, deductions and tax withholding is a regulated domain. The tool shows pre-computed data instead. |
| **Approval workflows** | Manager approvals and HR sign-off are organizational processes that add significant UI and state complexity beyond salary data management. |
| **Notifications and emails** | Out of scope for a salary data management tool. |
| **Real-time currency conversion** | Would add an external API dependency and rate-history concerns. Static exchange rates are used for normalization. |

## 6. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Search performance.** With 10K records loaded, list, search and filter responses appear in under 2 seconds at the 95th percentile, measured in the browser. |
| NFR-2 | **Dashboard performance.** The dashboard renders all KPIs and charts in under 2 seconds at the 95th percentile with 10K records. |
| NFR-3 | **Analytics accuracy.** Dashboard totals reconcile exactly with a direct SQL aggregation over the same data. Covered by automated tests. |
| NFR-4 | **Import performance.** A 10K-row valid CSV imports in under 30 seconds with bounded memory use. |
| NFR-5 | **Money correctness.** Monetary values are stored as integer minor units with a currency code. No floating-point arithmetic on money. |
| NFR-6 | **Browser support.** Current versions of Chrome, Firefox, Safari and Edge on desktop. |
| NFR-7 | **Accessibility.** Keyboard-navigable forms and tables, labelled inputs, and sufficient colour contrast (WCAG 2.1 AA as a target). |
| NFR-8 | **Portability.** The full stack starts with one command (`docker compose up`) on a clean machine. |

## 7. Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Backend | Python + FastAPI | Async-native, type-safe request validation via Pydantic, automatic OpenAPI/Swagger docs. |
| Database | SQLite + SQLAlchemy (async) | Zero-config and file-based; ample for 10K records. Models stay portable to PostgreSQL. |
| Frontend | Next.js + Ant Design | File-based routing and enterprise-grade table, form and chart-friendly components. Pages are client-rendered and call the API directly; server-side rendering is not required. |
| Styling | SCSS Modules | Scoped styles without a utility-class framework. |
| Testing | pytest (TDD) + Jest | Fast, deterministic, widely adopted. |
| Deployment | Docker Compose | One command to run the full stack anywhere. |

## 8. Success Criteria

1. **Find any employee fast.** The HR Manager can locate any employee by name in under 2 seconds (NFR-1).
2. **Accurate dashboard.** The dashboard loads within NFR-2 and its totals reconcile with direct SQL (NFR-3).
3. **Tracked salary changes.** 100% of base-salary changes produce a revision record with old value, new value, reason and effective date.
4. **Reliable import.** A 10K-row CSV imports within NFR-4. Invalid rows are reported with row number and reason without aborting the import.
5. **Tested.** Backend service and router code has at least 80% line coverage. Every API endpoint has at least one API-level test. Key frontend components (table, form, dashboard) have component tests covering loading, error and success states.
