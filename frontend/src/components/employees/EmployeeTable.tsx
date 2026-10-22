"use client";

import React from "react";
import { Table, Tag, Button, Tooltip, Popconfirm, Empty, Skeleton } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Employee } from "@/types";
import styles from "./EmployeeTable.module.scss";

interface EmployeeTableProps {
  employees: Employee[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onSortChange: (field: string, order: "asc" | "desc") => void;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onResetFilters?: () => void;
}

export default function EmployeeTable({
  employees,
  total,
  loading,
  page,
  pageSize,
  onPageChange,
  onSortChange,
  onView,
  onEdit,
  onDelete,
  onResetFilters,
}: EmployeeTableProps) {
  const formatCurrency = (val: number, cur: string) => {
    return `${cur} ${Number(val).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const columns: ColumnsType<Employee> = [
    {
      title: "Employee ID",
      dataIndex: "employee_id",
      key: "employee_id",
      width: 130,
      render: (id: string) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: "Name & Contact",
      key: "name",
      sorter: true,
      render: (_, record) => (
        <div className={styles.employeeCell}>
          <span className={styles.empName}>{record.full_name}</span>
          <span className={styles.empEmail}>{record.email}</span>
        </div>
      ),
    },
    {
      title: "Department & Role",
      key: "role",
      render: (_, record) => (
        <div className={styles.roleCell}>
          <span className={styles.roleTitle}>{record.designation}</span>
          <span className={styles.deptTag}>{record.department}</span>
        </div>
      ),
    },
    {
      title: "Country / Location",
      key: "location",
      render: (_, record) => (
        <span>
          {record.country}
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{record.city}</div>
        </span>
      ),
    },
    {
      title: "Annual Base Salary",
      dataIndex: "base_salary",
      key: "base_salary",
      sorter: true,
      render: (val: number, record) => (
        <div className={styles.salaryCell}>
          <span className={styles.localSalary}>
            {formatCurrency(val, record.currency)}
          </span>
          <span className={styles.usdSalary}>
            ~{formatUSD(record.base_salary_usd)} USD
          </span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "active" ? "success" : "default"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <div className={styles.actionCell}>
          <Tooltip title="View full profile & salary audit">
            <Button
              type="text"
              aria-label="View employee details"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
            />
          </Tooltip>

          <Tooltip title="Edit employee details">
            <Button
              type="text"
              aria-label="Edit employee"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>

          <Tooltip title="Delete employee">
            <Popconfirm
              title="Delete employee?"
              description={`Are you sure you want to delete ${record.full_name}? This action cannot be undone.`}
              onConfirm={() => onDelete(record)}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                aria-label="Delete employee"
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: any,
    sorter: any
  ) => {
    if (pagination.current && pagination.pageSize) {
      onPageChange(pagination.current, pagination.pageSize);
    }
    if (sorter.field && sorter.order) {
      onSortChange(
        sorter.field === "name" ? "first_name" : sorter.field,
        sorter.order === "ascend" ? "asc" : "desc"
      );
    }
  };

  return (
    <div className={styles.tableCard}>
      <Table
        dataSource={employees}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total.toLocaleString()} employees`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        onChange={handleTableChange}
        locale={{
          emptyText: (
            <div style={{ padding: "48px 0" }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No employees match your search or filter criteria"
              >
                {onResetFilters && (
                  <Button type="primary" onClick={onResetFilters}>
                    Clear All Filters
                  </Button>
                )}
              </Empty>
            </div>
          ),
        }}
      />
    </div>
  );
}
