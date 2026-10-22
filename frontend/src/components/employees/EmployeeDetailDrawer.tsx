"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Drawer,
  Tabs,
  Tag,
  Descriptions,
  Table,
  Skeleton,
  Empty,
  Avatar,
} from "antd";
import {
  UserOutlined,
  HistoryOutlined,
  FileTextOutlined,
  GiftOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { api } from "@/lib/api";
import styles from "./EmployeeDetailDrawer.module.scss";

interface EmployeeDetailDrawerProps {
  employeeId?: string | null;
  open: boolean;
  onClose: () => void;
}

export default function EmployeeDetailDrawer({
  employeeId,
  open,
  onClose,
}: EmployeeDetailDrawerProps) {
  const { data: employee, isLoading } = useQuery({
    queryKey: ["employee-detail", employeeId],
    queryFn: () => (employeeId ? api.getEmployeeDetails(employeeId) : null),
    enabled: !!employeeId && open,
  });

  const formatCurrency = (val: number, cur: string) => {
    return `${cur} ${Number(val).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Drawer
      title="Employee Profile & Compensation Record"
      placement="right"
      width={720}
      onClose={onClose}
      open={open}
      destroyOnClose
    >
      {isLoading || !employee ? (
        <Skeleton active avatar paragraph={{ rows: 8 }} />
      ) : (
        <div>
          {/* Header Card */}
          <div className={styles.profileHeader}>
            <Avatar size={54} icon={<UserOutlined />} className={styles.avatar} />

            <div className={styles.headerInfo}>
              <div className={styles.nameRow}>
                <span className={styles.fullName}>{employee.full_name}</span>
                <Tag color={employee.status === "active" ? "success" : "default"}>
                  {employee.status.toUpperCase()}
                </Tag>
                <Tag color="blue">{employee.employee_id}</Tag>
              </div>
              <div className={styles.designation}>
                {employee.designation} · {employee.department} · {employee.country}
              </div>
            </div>

            <div className={styles.salaryHighlight}>
              <div className={styles.salaryAmount}>
                {formatCurrency(employee.base_salary, employee.currency)}
              </div>
              <div className={styles.salaryUsd}>
                ~{formatUSD(employee.base_salary_usd)} USD / yr
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs
            defaultActiveKey="overview"
            items={[
              {
                key: "overview",
                label: (
                  <span>
                    <UserOutlined /> Overview
                  </span>
                ),
                children: (
                  <div className={styles.tabContent}>
                    <Descriptions bordered column={2} size="small">
                      <Descriptions.Item label="Employee ID">
                        {employee.employee_id}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        {employee.email}
                      </Descriptions.Item>
                      <Descriptions.Item label="Department">
                        {employee.department}
                      </Descriptions.Item>
                      <Descriptions.Item label="Role">
                        {employee.designation}
                      </Descriptions.Item>
                      <Descriptions.Item label="Country / City">
                        {employee.country}, {employee.city}
                      </Descriptions.Item>
                      <Descriptions.Item label="Gender">
                        {employee.gender}
                      </Descriptions.Item>
                      <Descriptions.Item label="Date of Joining">
                        {dayjs(employee.date_of_joining).format("MMMM D, YYYY")}
                      </Descriptions.Item>
                      <Descriptions.Item label="Date of Birth">
                        {dayjs(employee.date_of_birth).format("MMMM D, YYYY")}
                      </Descriptions.Item>
                      <Descriptions.Item label="Employment Type">
                        <Tag color="purple">
                          {employee.employment_type.toUpperCase()}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Salary Effective">
                        {dayjs(employee.salary_effective_date).format(
                          "MMMM D, YYYY"
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                ),
              },
              {
                key: "history",
                label: (
                  <span>
                    <HistoryOutlined /> Salary Audit History (
                    {employee.salary_revisions?.length || 0})
                  </span>
                ),
                children: (
                  <div className={styles.tabContent}>
                    {!employee.salary_revisions ||
                    employee.salary_revisions.length === 0 ? (
                      <Empty description="No past salary revisions recorded yet" />
                    ) : (
                      <Table
                        dataSource={employee.salary_revisions}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        columns={[
                          {
                            title: "Effective Date",
                            dataIndex: "effective_date",
                            key: "effective_date",
                            render: (d) => dayjs(d).format("MMM D, YYYY"),
                          },
                          {
                            title: "Previous Salary",
                            dataIndex: "old_salary",
                            key: "old_salary",
                            render: (val, r) => formatCurrency(val, r.currency),
                          },
                          {
                            title: "Revised Salary",
                            dataIndex: "new_salary",
                            key: "new_salary",
                            render: (val, r) => (
                              <strong style={{ color: "#059669" }}>
                                {formatCurrency(val, r.currency)}
                              </strong>
                            ),
                          },
                          {
                            title: "Reason / Justification",
                            dataIndex: "reason",
                            key: "reason",
                          },
                        ]}
                      />
                    )}
                  </div>
                ),
              },
              {
                key: "payroll",
                label: (
                  <span>
                    <FileTextOutlined /> Payroll Slips (
                    {employee.payroll_records?.length || 0})
                  </span>
                ),
                children: (
                  <div className={styles.tabContent}>
                    {!employee.payroll_records ||
                    employee.payroll_records.length === 0 ? (
                      <Empty description="No monthly payroll records found" />
                    ) : (
                      <Table
                        dataSource={employee.payroll_records}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                        size="small"
                        columns={[
                          {
                            title: "Period",
                            key: "period",
                            render: (_, r) => `${r.month}/${r.year}`,
                          },
                          {
                            title: "Gross",
                            dataIndex: "gross_salary",
                            render: (val, r) => formatCurrency(val, r.currency),
                          },
                          {
                            title: "Deductions",
                            dataIndex: "deductions",
                            render: (val, r) => (
                              <span style={{ color: "#dc2626" }}>
                                -{formatCurrency(val, r.currency)}
                              </span>
                            ),
                          },
                          {
                            title: "Net Paid",
                            dataIndex: "net_salary",
                            render: (val, r) => (
                              <strong>{formatCurrency(val, r.currency)}</strong>
                            ),
                          },
                          {
                            title: "Payment Date",
                            dataIndex: "payment_date",
                            render: (d) => dayjs(d).format("MMM D, YYYY"),
                          },
                          {
                            title: "Status",
                            dataIndex: "status",
                            render: (s) => (
                              <Tag color={s === "paid" ? "green" : "orange"}>
                                {s.toUpperCase()}
                              </Tag>
                            ),
                          },
                        ]}
                      />
                    )}
                  </div>
                ),
              },
              {
                key: "bonuses_leaves",
                label: (
                  <span>
                    <GiftOutlined /> Bonuses & Leaves
                  </span>
                ),
                children: (
                  <div className={styles.tabContent}>
                    <h4 style={{ marginBottom: 8 }}>Bonuses Awarded</h4>
                    {employee.bonuses && employee.bonuses.length > 0 ? (
                      <Table
                        dataSource={employee.bonuses}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        columns={[
                          {
                            title: "Date",
                            dataIndex: "date_awarded",
                            render: (d) => dayjs(d).format("MMM D, YYYY"),
                          },
                          {
                            title: "Type",
                            dataIndex: "bonus_type",
                            render: (t) => <Tag color="gold">{t.toUpperCase()}</Tag>,
                          },
                          {
                            title: "Amount",
                            dataIndex: "amount",
                            render: (val, r) => (
                              <strong>{formatCurrency(val, r.currency)}</strong>
                            ),
                          },
                          { title: "Reason", dataIndex: "reason" },
                        ]}
                      />
                    ) : (
                      <p style={{ color: "#94a3b8", marginBottom: 20 }}>
                        No bonus history for this employee.
                      </p>
                    )}

                    <h4 style={{ margin: "16px 0 8px 0" }}>Leave Records</h4>
                    {employee.leaves && employee.leaves.length > 0 ? (
                      <Table
                        dataSource={employee.leaves}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        columns={[
                          {
                            title: "Leave Type",
                            dataIndex: "leave_type",
                            render: (t) => <Tag color="blue">{t.toUpperCase()}</Tag>,
                          },
                          {
                            title: "Start Date",
                            dataIndex: "start_date",
                            render: (d) => dayjs(d).format("MMM D, YYYY"),
                          },
                          {
                            title: "End Date",
                            dataIndex: "end_date",
                            render: (d) => dayjs(d).format("MMM D, YYYY"),
                          },
                          { title: "Days", dataIndex: "days" },
                          {
                            title: "Status",
                            dataIndex: "status",
                            render: (s) => <Tag color="green">{s.toUpperCase()}</Tag>,
                          },
                        ]}
                      />
                    ) : (
                      <p style={{ color: "#94a3b8" }}>No leaves on record.</p>
                    )}
                  </div>
                ),
              },
              {
                key: "reimbursements",
                label: (
                  <span>
                    <DollarOutlined /> Claims (
                    {employee.reimbursements?.length || 0})
                  </span>
                ),
                children: (
                  <div className={styles.tabContent}>
                    {employee.reimbursements &&
                    employee.reimbursements.length > 0 ? (
                      <Table
                        dataSource={employee.reimbursements}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        columns={[
                          {
                            title: "Date",
                            dataIndex: "date_submitted",
                            render: (d) => dayjs(d).format("MMM D, YYYY"),
                          },
                          {
                            title: "Category",
                            dataIndex: "category",
                            render: (c) => <Tag>{c.toUpperCase()}</Tag>,
                          },
                          {
                            title: "Amount",
                            dataIndex: "amount",
                            render: (val, r) => formatCurrency(val, r.currency),
                          },
                          {
                            title: "Status",
                            dataIndex: "status",
                            render: (s) => <Tag color="green">{s.toUpperCase()}</Tag>,
                          },
                        ]}
                      />
                    ) : (
                      <Empty description="No reimbursement claims submitted" />
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
    </Drawer>
  );
}
