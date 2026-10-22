"use client";

import React from "react";
import { Card, Table, Tag, Skeleton, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CountryStat } from "@/types";
import styles from "./CountryAnalytics.module.scss";

interface CountryAnalyticsProps {
  data?: CountryStat[];
  loading: boolean;
}

const COUNTRY_FLAGS: Record<string, string> = {
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  India: "🇮🇳",
  Singapore: "🇸🇬",
  Switzerland: "🇨🇭",
  Japan: "🇯🇵",
};

export default function CountryAnalytics({
  data,
  loading,
}: CountryAnalyticsProps) {
  if (loading || !data) {
    return (
      <Card className={styles.countryCard}>
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

  const columns: ColumnsType<CountryStat> = [
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      render: (text: string) => (
        <span>
          <span style={{ marginRight: 8, fontSize: 16 }}>
            {COUNTRY_FLAGS[text] || "🌐"}
          </span>
          <strong>{text}</strong>
        </span>
      ),
    },
    {
      title: "Employees",
      dataIndex: "employee_count",
      key: "employee_count",
      sorter: (a, b) => a.employee_count - b.employee_count,
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: "Total Payroll (USD)",
      dataIndex: "total_salary_usd",
      key: "total_salary_usd",
      sorter: (a, b) => a.total_salary_usd - b.total_salary_usd,
      render: (val: number) => <strong>{formatMoney(val)}</strong>,
    },
    {
      title: "Avg Compensation",
      dataIndex: "average_salary_usd",
      key: "average_salary_usd",
      sorter: (a, b) => a.average_salary_usd - b.average_salary_usd,
      render: (val: number) => formatMoney(val),
    },
    {
      title: "Local Currency",
      dataIndex: "primary_currency",
      key: "primary_currency",
      render: (cur: string) => <Tag color="geekblue">{cur}</Tag>,
    },
  ];

  return (
    <Card className={styles.countryCard}>
      <div className={styles.cardHeader}>
        <div className={styles.title}>Geographic Compensation Distribution</div>
        <div className={styles.subtitle}>
          Headcount and payroll statistics across 10 global operational hubs
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="country"
          scroll={{ x: 650 }}
          pagination={{ pageSize: 5, size: "small" }}
          size="middle"
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No regional compensation records found"
              />
            ),
          }}
        />
      </div>
    </Card>
  );
}
