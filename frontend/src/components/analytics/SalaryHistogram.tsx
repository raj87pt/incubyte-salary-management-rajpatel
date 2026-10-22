"use client";

import React from "react";
import { Card, Skeleton, Tooltip } from "antd";
import { SalaryBucket } from "@/types";
import styles from "./SalaryHistogram.module.scss";

interface SalaryHistogramProps {
  data?: SalaryBucket[];
  loading: boolean;
  totalEmployees?: number;
}

export default function SalaryHistogram({
  data,
  loading,
  totalEmployees = 10000,
}: SalaryHistogramProps) {
  if (loading || !data) {
    return (
      <Card className={styles.histoCard}>
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card className={styles.histoCard}>
      <div className={styles.header}>
        <div className={styles.title}>Salary Tier Distribution</div>
        <div className={styles.subtitle}>
          Normalized distribution curve across compensation brackets (USD)
        </div>
      </div>

      <div className={styles.barsGrid}>
        {data.map((bucket) => {
          const heightPct = (bucket.count / maxCount) * 100;
          const share = ((bucket.count / (totalEmployees || 1)) * 100).toFixed(1);

          return (
            <div key={bucket.bucket} className={styles.barCol}>
              <span className={styles.barValue}>{bucket.count.toLocaleString()}</span>

              <Tooltip
                title={`${bucket.bucket}: ${bucket.count.toLocaleString()} employees (${share}% of organization)`}
              >
                <div
                  className={styles.barPillar}
                  style={{ height: `${Math.max(heightPct, 8)}%` }}
                />
              </Tooltip>

              <span className={styles.barLabel}>{bucket.bucket}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
