"use client";

import React from "react";
import { Card, Skeleton } from "antd";
import {
  DollarCircleOutlined,
  TeamOutlined,
  RiseOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { DashboardMetrics } from "@/types";
import styles from "./KPICards.module.scss";

interface KPICardsProps {
  metrics?: DashboardMetrics;
  loading: boolean;
}

export default function KPICards({ metrics, loading }: KPICardsProps) {
  if (loading || !metrics) {
    return (
      <div className={styles.kpiGrid}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className={styles.kpiCard}>
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
        ))}
      </div>
    );
  }

  // Format currency in compact / full USD format
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const activeRate = (
    (metrics.active_employees / (metrics.total_employees || 1)) *
    100
  ).toFixed(1);

  return (
    <div className={styles.kpiGrid}>
      <Card className={styles.kpiCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Total Annual Payroll</span>
          <div className={`${styles.iconWrapper} ${styles.primaryIcon}`}>
            <DollarCircleOutlined />
          </div>
        </div>
        <div className={styles.cardValue}>
          {formatMoney(metrics.total_payroll_usd)}
        </div>
        <div className={styles.cardSubtext}>
          Across all global jurisdictions (USD)
        </div>
      </Card>

      <Card className={styles.kpiCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Active Headcount</span>
          <div className={`${styles.iconWrapper} ${styles.successIcon}`}>
            <TeamOutlined />
          </div>
        </div>
        <div className={styles.cardValue}>
          {metrics.active_employees.toLocaleString()}
        </div>
        <div className={styles.cardSubtext}>
          {activeRate}% retention of {metrics.total_employees.toLocaleString()} total
        </div>
      </Card>

      <Card className={styles.kpiCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Avg Compensation</span>
          <div className={`${styles.iconWrapper} ${styles.warningIcon}`}>
            <RiseOutlined />
          </div>
        </div>
        <div className={styles.cardValue}>
          {formatMoney(metrics.average_salary_usd)}
        </div>
        <div className={styles.cardSubtext}>
          Median: {formatMoney(metrics.median_salary_usd)}
        </div>
      </Card>

      <Card className={styles.kpiCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Global Footprint</span>
          <div className={`${styles.iconWrapper} ${styles.purpleIcon}`}>
            <ApartmentOutlined />
          </div>
        </div>
        <div className={styles.cardValue}>
          {metrics.total_departments} Depts · {metrics.total_countries} Countries
        </div>
        <div className={styles.cardSubtext}>
          {Object.keys(metrics.currency_breakdown).length} active currencies supported
        </div>
      </Card>
    </div>
  );
}
