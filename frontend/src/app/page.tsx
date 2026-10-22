"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button, Alert, message } from "antd";
import {
  TeamOutlined,
  UserAddOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { api } from "@/lib/api";
import AppLayout from "@/components/layout/AppLayout";
import KPICards from "@/components/analytics/KPICards";
import DepartmentAnalytics from "@/components/analytics/DepartmentAnalytics";
import CountryAnalytics from "@/components/analytics/CountryAnalytics";
import SalaryHistogram from "@/components/analytics/SalaryHistogram";
import EmployeeFormModal from "@/components/employees/EmployeeFormModal";

import styles from "./page.module.scss";

export default function DashboardPage() {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch Dashboard Metrics
  const {
    data: metrics,
    isLoading: loadingMetrics,
    isError: errorMetrics,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: api.getDashboardMetrics,
  });

  // Fetch Department Stats
  const {
    data: deptStats,
    isLoading: loadingDept,
    isError: errorDept,
    refetch: refetchDept,
  } = useQuery({
    queryKey: ["department-stats"],
    queryFn: api.getDepartmentStats,
  });

  // Fetch Country Stats
  const {
    data: countryStats,
    isLoading: loadingCountry,
    isError: errorCountry,
    refetch: refetchCountry,
  } = useQuery({
    queryKey: ["country-stats"],
    queryFn: api.getCountryStats,
  });

  // Fetch Salary Distribution
  const {
    data: distribution,
    isLoading: loadingDist,
    isError: errorDist,
    refetch: refetchDist,
  } = useQuery({
    queryKey: ["salary-distribution"],
    queryFn: api.getSalaryDistribution,
  });

  const hasAnyError = errorMetrics || errorDept || errorCountry || errorDist;

  const handleRefetchAll = () => {
    refetchMetrics();
    refetchDept();
    refetchCountry();
    refetchDist();
  };

  const handleExportCsv = async () => {
    try {
      message.loading({ content: "Exporting payroll CSV...", key: "exporting" });
      await api.downloadEmployeesCsv(undefined, "payvantage_payroll_export.csv");
      message.success({ content: "Payroll CSV exported successfully!", key: "exporting" });
    } catch (e) {
      message.error({ content: "Failed to export payroll CSV.", key: "exporting" });
    }
  };

  return (
    <AppLayout>
      <div className={styles.dashboardContainer}>
        {hasAnyError && (
          <div style={{ marginBottom: 8 }}>
            <Alert
              type="error"
              showIcon
              message="Analytics Data Sync Failed"
              description="Unable to fetch the latest payroll analytics from the backend service. Check server connection or retry."
              action={
                <Button size="small" danger type="primary" onClick={handleRefetchAll}>
                  Retry Sync
                </Button>
              }
              style={{ borderRadius: 10 }}
            />
          </div>
        )}

        {/* Top Header Bar */}
        <div className={styles.topBar}>
          <div className={styles.titleArea}>
            <h1 className={styles.mainTitle}>Compensation & Headcount Analytics</h1>
            <p className={styles.subtitle}>
              Global overview of how ACME org compensates its 10,000 employees across 10 countries
            </p>
          </div>

          <div className={styles.actionButtons}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetchMetrics()}
            >
              Refresh
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportCsv}
            >
              Export Payroll CSV
            </Button>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Employee
            </Button>
            <Button
              icon={<TeamOutlined />}
              onClick={() => router.push("/employees")}
            >
              View Directory
            </Button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <KPICards metrics={metrics} loading={loadingMetrics} />

        {/* Charts Grid */}
        <div className={styles.chartsRow}>
          <DepartmentAnalytics data={deptStats} loading={loadingDept} />
          <SalaryHistogram
            data={distribution}
            loading={loadingDist}
            totalEmployees={metrics?.total_employees}
          />
        </div>

        {/* Geographic Breakdown */}
        <div className={styles.fullRow}>
          <CountryAnalytics data={countryStats} loading={loadingCountry} />
        </div>
      </div>

      {/* Add Employee Modal */}
      <EmployeeFormModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          refetchMetrics();
        }}
      />
    </AppLayout>
  );
}
