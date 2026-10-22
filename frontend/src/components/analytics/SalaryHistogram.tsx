"use client";

import React from "react";
import { Card, Skeleton, Tooltip, Empty } from "antd";
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
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className={styles.histoCard}>
        <div className={styles.title}>Salary Tier Distribution</div>
        <div style={{ padding: "48px 0" }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No salary tier distribution data available"
          />
        </div>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const totalCount = data.reduce((sum, d) => sum + d.count, 0) || totalEmployees || 1;

  // Identify peak cohort
  const peakBucket = data.reduce(
    (prev, curr) => (curr.count > prev.count ? curr : prev),
    data[0] || { bucket: "", count: 0 }
  );

  // High-value macro groupings (zero redundancy with individual bars)
  const coreCount = data
    .filter((d) => d.bucket === "$80k - $120k" || d.bucket === "$120k - $160k")
    .reduce((sum, d) => sum + d.count, 0);
  const corePct = ((coreCount / totalCount) * 100).toFixed(1);

  const upperCount = data
    .filter((d) => d.bucket === "$160k - $200k" || d.bucket === "> $200k")
    .reduce((sum, d) => sum + d.count, 0);
  const upperPct = ((upperCount / totalCount) * 100).toFixed(1);

  const peakPct = ((peakBucket.count / totalCount) * 100).toFixed(1);

  return (
    <Card className={styles.histoCard}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Salary Tier Distribution</div>
          <div className={styles.subtitle}>
            USD base compensation curve across global workforce
          </div>
        </div>

        <span className={styles.totalBadge}>
          {totalCount.toLocaleString()} Total Staff
        </span>
      </div>

      {/* Hero Histogram Chart */}
      <div className={styles.chartWrapper}>
        <div className={styles.gridLines}>
          <div className={styles.gridLine} />
          <div className={styles.gridLine} />
          <div className={styles.gridLine} />
        </div>

        <div className={styles.barsGrid}>
          {data.map((bucket) => {
            const heightPct = (bucket.count / maxCount) * 100;
            const share = ((bucket.count / totalCount) * 100).toFixed(1);
            const isPeak = bucket.bucket === peakBucket?.bucket;

            return (
              <div key={bucket.bucket} className={styles.barCol}>
                <div className={styles.barStats}>
                  <span className={`${styles.barValue} ${isPeak ? styles.peakValue : ""}`}>
                    {bucket.count.toLocaleString()}
                  </span>
                  <span className={styles.barShare}>{share}%</span>
                </div>

                <Tooltip
                  title={`${bucket.bucket}: ${bucket.count.toLocaleString()} employees (${share}% of total)`}
                >
                  <div className={styles.pillarTrack}>
                    <div
                      className={`${styles.barPillar} ${isPeak ? styles.peakPillar : ""}`}
                      style={{ height: `${Math.max(heightPct, 12)}%` }}
                    />
                  </div>
                </Tooltip>

                <span className={styles.barLabel}>{bucket.bucket}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* High-Value Macro Metrics (Minimal Text, Maximum Strategic Value) */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>PEAK COHORT</span>
          <span className={styles.metricValue}>{peakBucket.bucket}</span>
          <span className={styles.metricSub}>
            {peakBucket.count.toLocaleString()} staff ({peakPct}%)
          </span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>CORE WORKFORCE</span>
          <span className={styles.metricValue}>{corePct}%</span>
          <span className={styles.metricSub}>
            {coreCount.toLocaleString()} staff in $80k–$160k
          </span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>SENIOR & EXECUTIVE</span>
          <span className={styles.metricValue}>{upperPct}%</span>
          <span className={styles.metricSub}>
            {upperCount.toLocaleString()} staff &gt; $160k
          </span>
        </div>
      </div>
    </Card>
  );
}
