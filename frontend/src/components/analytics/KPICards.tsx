"use client";

import React from "react";
import { Card, Skeleton, Progress } from "antd";
import {
  DollarCircleOutlined,
  TeamOutlined,
  RiseOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
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
      <div className={styles.bentoContainer}>
        <div className={styles.heroSkeleton}>
          <Card className={styles.cardSkeleton}>
            <Skeleton active paragraph={{ rows: 3 }} />
          </Card>
        </div>
        <div className={styles.tilesSkeleton}>
          {[1, 2, 3].map((i) => (
            <Card key={i} className={styles.cardSkeleton}>
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const activeRate = Number(
    (
      (metrics.active_employees / (metrics.total_employees || 1)) *
      100
    ).toFixed(1)
  );

  return (
    <div className={styles.bentoContainer}>
      {/* Primary Hero Card: Total Payroll */}
      <Card className={`${styles.kpiCard} ${styles.heroCard}`}>
        <div className={styles.heroContent}>
          <div className={styles.cardHeader}>
            <div className={styles.titleBadgeGroup}>
              <span className={styles.cardTitle}>Total Annual Payroll</span>
              <span className={styles.verifiedTag}>
                <SafetyCertificateOutlined /> Verified Audit
              </span>
            </div>
            <div className={`${styles.iconWrapper} ${styles.heroIcon}`}>
              <DollarCircleOutlined />
            </div>
          </div>

          <div className={styles.heroBody}>
            <div className={styles.heroValue}>
              {formatMoney(metrics.total_payroll_usd)}
            </div>
            <div className={styles.cardSubtext}>
              Across all global jurisdictions (USD)
            </div>
          </div>

          <div className={styles.currencyPillsRow}>
            {Object.entries(metrics.currency_breakdown).slice(0, 4).map(([cur, count]) => (
              <span key={cur} className={styles.curPill}>
                <strong>{cur}</strong> {count.toLocaleString()} staff
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Secondary Metric Tiles Grid */}
      <div className={styles.tilesGrid}>
        {/* Active Headcount */}
        <Card className={`${styles.kpiCard} ${styles.tileCard}`}>
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
          <div className={styles.progressBarWrapper}>
            <Progress
              percent={activeRate}
              showInfo={false}
              strokeColor="#10b981"
              railColor="#f1f5f9"
              size="small"
            />
          </div>
        </Card>

        {/* Avg Compensation */}
        <Card className={`${styles.kpiCard} ${styles.tileCard}`}>
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
          <div className={styles.deltaBadge}>
            +{(metrics.average_salary_usd / (metrics.median_salary_usd || 1) * 100 - 100).toFixed(1)}% vs median benchmark
          </div>
        </Card>

        {/* Global Footprint */}
        <Card className={`${styles.kpiCard} ${styles.tileCard}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Global Footprint</span>
            <div className={`${styles.iconWrapper} ${styles.skyIcon}`}>
              <GlobalOutlined />
            </div>
          </div>
          <div className={styles.cardValue}>
            {metrics.total_departments} Depts · {metrics.total_countries} Countries
          </div>
          <div className={styles.cardSubtext}>
            {Object.keys(metrics.currency_breakdown).length} active currencies supported
          </div>
          <div className={styles.countryMiniTags}>
            <span className={styles.countryDotTag}>🇺🇸 US</span>
            <span className={styles.countryDotTag}>🇬🇧 UK</span>
            <span className={styles.countryDotTag}>🇩🇪 DE</span>
            <span className={styles.countryDotTag}>🇮🇳 IN</span>
            <span className={styles.countryDotTag}>+6 more</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
