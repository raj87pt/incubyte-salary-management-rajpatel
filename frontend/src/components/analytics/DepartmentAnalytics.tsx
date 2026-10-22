"use client";

import React, { useState } from "react";
import { Card, Segmented, Skeleton, Tooltip } from "antd";
import { DepartmentStat } from "@/types";
import styles from "./DepartmentAnalytics.module.scss";

interface DepartmentAnalyticsProps {
  data?: DepartmentStat[];
  loading: boolean;
}

export default function DepartmentAnalytics({
  data,
  loading,
}: DepartmentAnalyticsProps) {
  const [metric, setMetric] = useState<"spend" | "average" | "headcount">("spend");

  if (loading || !data) {
    return (
      <Card className={styles.deptCard}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Sort based on selected metric
  const sortedData = [...data].sort((a, b) => {
    if (metric === "spend") return b.total_salary_usd - a.total_salary_usd;
    if (metric === "average") return b.average_salary_usd - a.average_salary_usd;
    return b.employee_count - a.employee_count;
  });

  const maxSpend = Math.max(...data.map((d) => d.total_salary_usd), 1);
  const maxAvg = Math.max(...data.map((d) => d.average_salary_usd), 1);
  const maxHeadcount = Math.max(...data.map((d) => d.employee_count), 1);

  return (
    <Card className={styles.deptCard}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.chartTitle}>Compensation by Department</div>
          <div className={styles.chartSubtitle}>
            Cross-department compensation comparison in USD
          </div>
        </div>

        <Segmented
          options={[
            { label: "Total Spend", value: "spend" },
            { label: "Avg Salary", value: "average" },
            { label: "Headcount", value: "headcount" },
          ]}
          value={metric}
          onChange={(val) => setMetric(val as any)}
        />
      </div>

      <div className={styles.itemList}>
        {sortedData.map((dept) => {
          let percentage = 0;
          if (metric === "spend") {
            percentage = (dept.total_salary_usd / maxSpend) * 100;
          } else if (metric === "average") {
            percentage = (dept.average_salary_usd / maxAvg) * 100;
          } else {
            percentage = (dept.employee_count / maxHeadcount) * 100;
          }

          return (
            <div key={dept.department} className={styles.deptItem}>
              <div className={styles.itemTop}>
                <div className={styles.deptName}>
                  <span>{dept.department}</span>
                  <span className={styles.deptHeadcount}>
                    {dept.employee_count.toLocaleString()} staff
                  </span>
                </div>

                <div className={styles.deptStats}>
                  {metric === "spend" && (
                    <Tooltip title={`Avg: ${formatMoney(dept.average_salary_usd)} / employee`}>
                      <span className={styles.totalSalary}>
                        {formatMoney(dept.total_salary_usd)}
                      </span>
                    </Tooltip>
                  )}
                  {metric === "average" && (
                    <Tooltip title={`Total: ${formatMoney(dept.total_salary_usd)}`}>
                      <span className={styles.totalSalary}>
                        {formatMoney(dept.average_salary_usd)} avg
                      </span>
                    </Tooltip>
                  )}
                  {metric === "headcount" && (
                    <span className={styles.totalSalary}>
                      {dept.employee_count.toLocaleString()} employees
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.progressBarContainer}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${Math.max(percentage, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
