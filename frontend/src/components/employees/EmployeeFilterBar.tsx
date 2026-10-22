"use client";

import React from "react";
import { Input, Select, Button } from "antd";
import { SearchOutlined, UndoOutlined } from "@ant-design/icons";
import { EmployeeFilterParams } from "@/types";
import styles from "./EmployeeFilterBar.module.scss";

interface EmployeeFilterBarProps {
  filters: EmployeeFilterParams;
  onChange: (updated: Partial<EmployeeFilterParams>) => void;
  onReset: () => void;
}

const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Sales",
  "Marketing",
  "Customer Support",
  "Human Resources",
  "Finance & Legal",
];

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Canada",
  "Australia",
  "India",
  "Singapore",
  "Switzerland",
  "Japan",
];

export default function EmployeeFilterBar({
  filters,
  onChange,
  onReset,
}: EmployeeFilterBarProps) {
  return (
    <div className={styles.filterContainer}>
      <Input
        placeholder="Search by name, email, employee ID, role..."
        prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
        allowClear
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value, page: 1 })}
        className={styles.searchInput}
      />

      <Select
        placeholder="Department"
        allowClear
        value={filters.department}
        onChange={(val) => onChange({ department: val, page: 1 })}
        className={styles.selectItem}
      >
        {DEPARTMENTS.map((d) => (
          <Select.Option key={d} value={d}>
            {d}
          </Select.Option>
        ))}
      </Select>

      <Select
        placeholder="Country"
        allowClear
        value={filters.country}
        onChange={(val) => onChange({ country: val, page: 1 })}
        className={styles.selectItem}
      >
        {COUNTRIES.map((c) => (
          <Select.Option key={c} value={c}>
            {c}
          </Select.Option>
        ))}
      </Select>

      <Select
        placeholder="Status"
        allowClear
        value={filters.status}
        onChange={(val) => onChange({ status: val, page: 1 })}
        style={{ width: 120 }}
      >
        <Select.Option value="active">Active</Select.Option>
        <Select.Option value="inactive">Inactive</Select.Option>
      </Select>

      <Select
        placeholder="Type"
        allowClear
        value={filters.employment_type}
        onChange={(val) => onChange({ employment_type: val, page: 1 })}
        style={{ width: 130 }}
      >
        <Select.Option value="full-time">Full-time</Select.Option>
        <Select.Option value="part-time">Part-time</Select.Option>
        <Select.Option value="contract">Contract</Select.Option>
      </Select>

      <Button icon={<UndoOutlined />} onClick={onReset} className={styles.resetBtn}>
        Reset
      </Button>
    </div>
  );
}
