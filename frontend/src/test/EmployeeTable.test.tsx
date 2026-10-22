import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EmployeeTable from "@/components/employees/EmployeeTable";
import { Employee } from "@/types";

const mockEmployees: Employee[] = [
  {
    id: 1,
    employee_id: "EMP-00001",
    first_name: "Danielle",
    last_name: "Johnson",
    full_name: "Danielle Johnson",
    email: "danielle.johnson1@acme.org",
    department: "Engineering",
    job_title: "Principal Engineer",
    designation: "Principal Engineer",
    country: "India",
    city: "Pune",
    employment_type: "Full-Time",
    status: "ACTIVE",
    base_salary: 3028400,
    currency: "INR",
    base_salary_usd: 36341,
    hire_date: "2021-03-15",
    created_at: "2021-03-15T00:00:00Z",
    updated_at: "2021-03-15T00:00:00Z",
  },
  {
    id: 2,
    employee_id: "EMP-00002",
    first_name: "Joshua",
    last_name: "Walker",
    full_name: "Joshua Walker",
    email: "joshua.walker2@acme.org",
    department: "Sales",
    job_title: "Account Executive",
    designation: "Account Executive",
    country: "United States",
    city: "San Francisco",
    employment_type: "Full-Time",
    status: "ACTIVE",
    base_salary: 113200,
    currency: "USD",
    base_salary_usd: 113200,
    hire_date: "2022-06-01",
    created_at: "2022-06-01T00:00:00Z",
    updated_at: "2022-06-01T00:00:00Z",
  },
];

describe("EmployeeTable Component", () => {
  const defaultProps = {
    employees: mockEmployees,
    total: 2,
    loading: false,
    page: 1,
    pageSize: 20,
    onPageChange: vi.fn(),
    onSortChange: vi.fn(),
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onResetFilters: vi.fn(),
  };

  it("renders employee rows and formatted salary columns", () => {
    render(<EmployeeTable {...defaultProps} />);

    expect(screen.getByText("EMP-00001")).toBeInTheDocument();
    expect(screen.getByText("Danielle Johnson")).toBeInTheDocument();
    expect(screen.getByText("danielle.johnson1@acme.org")).toBeInTheDocument();
    expect(screen.getByText("Principal Engineer")).toBeInTheDocument();

    expect(screen.getByText("EMP-00002")).toBeInTheDocument();
    expect(screen.getByText("Joshua Walker")).toBeInTheDocument();
    expect(screen.getByText("Account Executive")).toBeInTheDocument();
  });

  it("calls onView when View button is clicked", () => {
    render(<EmployeeTable {...defaultProps} />);
    const viewButtons = screen.getAllByRole("button", { name: /view employee details/i });
    expect(viewButtons.length).toBeGreaterThan(0);
    fireEvent.click(viewButtons[0]);
    expect(defaultProps.onView).toHaveBeenCalledWith(mockEmployees[0]);
  });

  it("renders empty state with Clear All Filters button when no records found", () => {
    const handleReset = vi.fn();
    render(
      <EmployeeTable
        {...defaultProps}
        employees={[]}
        total={0}
        onResetFilters={handleReset}
      />
    );

    expect(
      screen.getByText("No employees match your search or filter criteria")
    ).toBeInTheDocument();
    const clearBtn = screen.getByRole("button", { name: /clear all filters/i });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
