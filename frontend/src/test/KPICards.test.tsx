import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import KPICards from "@/components/analytics/KPICards";
import { DashboardMetrics } from "@/types";

const mockMetrics: DashboardMetrics = {
  total_payroll_usd: 1134885900,
  active_employees: 9406,
  total_employees: 10000,
  average_salary_usd: 120656,
  median_salary_usd: 114944,
  total_departments: 8,
  total_countries: 10,
  currency_breakdown: {
    USD: 3536,
    EUR: 1253,
    INR: 1466,
    GBP: 1464,
  },
  department_breakdown: [],
  country_breakdown: [],
  salary_distribution: [],
};

describe("KPICards Component", () => {
  it("renders skeletons when loading is true", () => {
    const { container } = render(<KPICards loading={true} />);
    const skeletons = container.querySelectorAll(".ant-skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders executive KPI values correctly when loaded", () => {
    render(<KPICards metrics={mockMetrics} loading={false} />);

    // Total Payroll
    expect(screen.getByText("Total Annual Payroll")).toBeInTheDocument();
    expect(screen.getByText("$1,134,885,900")).toBeInTheDocument();

    // Active Headcount & retention rate
    expect(screen.getByText("Active Headcount")).toBeInTheDocument();
    expect(screen.getByText("9,406")).toBeInTheDocument();
    expect(screen.getByText(/94.1% retention of 10,000 total/i)).toBeInTheDocument();

    // Average & Median Compensation
    expect(screen.getByText("Avg Compensation")).toBeInTheDocument();
    expect(screen.getByText("$120,656")).toBeInTheDocument();
    expect(screen.getByText(/Median: \$114,944/i)).toBeInTheDocument();

    // Global Footprint
    expect(screen.getByText("Global Footprint")).toBeInTheDocument();
    expect(screen.getByText("8 Depts · 10 Countries")).toBeInTheDocument();
  });
});
