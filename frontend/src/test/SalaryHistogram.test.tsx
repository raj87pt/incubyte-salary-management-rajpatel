import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SalaryHistogram from "@/components/analytics/SalaryHistogram";
import { SalaryBucket } from "@/types";

const mockBuckets: SalaryBucket[] = [
  { bucket: "< $50k", count: 1361, percentage: 13.6 },
  { bucket: "$50k - $80k", count: 1290, percentage: 12.9 },
  { bucket: "$80k - $120k", count: 2647, percentage: 26.5 },
  { bucket: "$120k - $160k", count: 2227, percentage: 22.3 },
  { bucket: "$160k - $200k", count: 1428, percentage: 14.3 },
  { bucket: "> $200k", count: 1047, percentage: 10.5 },
];

describe("SalaryHistogram Component", () => {
  it("renders loading skeleton when loading is true", () => {
    const { container } = render(<SalaryHistogram loading={true} />);
    const skeletons = container.querySelectorAll(".ant-skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders empty state when data is empty", () => {
    render(<SalaryHistogram data={[]} loading={false} />);
    expect(
      screen.getByText("No salary tier distribution data available")
    ).toBeInTheDocument();
  });

  it("identifies peak cohort and calculates macro grouping percentages correctly", () => {
    render(<SalaryHistogram data={mockBuckets} loading={false} totalEmployees={10000} />);

    // Title & total badge
    expect(screen.getByText("Salary Tier Distribution")).toBeInTheDocument();
    expect(screen.getByText("10,000 Total Staff")).toBeInTheDocument();

    // Peak cohort ($80k - $120k)
    expect(screen.getByText("PEAK COHORT")).toBeInTheDocument();
    expect(screen.getByText(/2,647 staff \(26.5%\)/i)).toBeInTheDocument();

    // Core workforce ($80k-$160k = 2647 + 2227 = 4874 => 48.7%)
    expect(screen.getByText("CORE WORKFORCE")).toBeInTheDocument();
    expect(screen.getByText("48.7%")).toBeInTheDocument();
    expect(screen.getByText(/4,874 staff in \$80k–\$160k/i)).toBeInTheDocument();

    // Senior & Executive (> $160k = 1428 + 1047 = 2475 => 24.8%)
    expect(screen.getByText("SENIOR & EXECUTIVE")).toBeInTheDocument();
    expect(screen.getByText("24.8%")).toBeInTheDocument();
  });
});
