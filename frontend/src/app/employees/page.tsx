"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, message } from "antd";
import {
  UserAddOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { api } from "@/lib/api";
import { Employee, EmployeeFilterParams } from "@/types";
import AppLayout from "@/components/layout/AppLayout";
import EmployeeFilterBar from "@/components/employees/EmployeeFilterBar";
import EmployeeTable from "@/components/employees/EmployeeTable";
import EmployeeFormModal from "@/components/employees/EmployeeFormModal";
import EmployeeDetailDrawer from "@/components/employees/EmployeeDetailDrawer";

import styles from "./page.module.scss";

export default function EmployeesPage() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<EmployeeFilterParams>({
    page: 1,
    page_size: 20,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Fetch employees
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["employees", filters],
    queryFn: () => api.getEmployees(filters),
  });

  const handleFilterChange = (updated: Partial<EmployeeFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      page_size: 20,
      sort_by: "created_at",
      sort_order: "desc",
    });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setFilters((prev) => ({ ...prev, page, page_size: pageSize }));
  };

  const handleSortChange = (field: string, order: "asc" | "desc") => {
    setFilters((prev) => ({ ...prev, sort_by: field, sort_order: order }));
  };

  const handleView = (employee: Employee) => {
    setSelectedEmployeeId(employee.id);
    setIsDetailOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (employee: Employee) => {
    try {
      await api.deleteEmployee(employee.id);
      message.success(`Employee ${employee.full_name} deleted`);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    } catch (err) {
      message.error("Failed to delete employee");
    }
  };

  const handleExportCsv = () => {
    window.open(api.getExportUrl(), "_blank");
  };

  return (
    <AppLayout>
      <div className={styles.pageContainer}>
        {/* Top Header */}
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.mainTitle}>Employee Directory</h1>
            <p className={styles.subtitle}>
              Manage and query compensation data for all {data?.total?.toLocaleString() || "10,000"} employees
            </p>
          </div>

          <div className={styles.actions}>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              Refresh
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExportCsv}>
              Export Filtered CSV
            </Button>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => {
                setEmployeeToEdit(null);
                setIsFormModalOpen(true);
              }}
            >
              Add Employee
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <EmployeeFilterBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Employee Table */}
        <EmployeeTable
          employees={data?.items || []}
          total={data?.total || 0}
          loading={isLoading}
          page={filters.page || 1}
          pageSize={filters.page_size || 20}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Detail Drawer */}
      <EmployeeDetailDrawer
        employeeId={selectedEmployeeId}
        open={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedEmployeeId(null);
        }}
      />

      {/* Add / Edit Modal */}
      <EmployeeFormModal
        open={isFormModalOpen}
        employeeToEdit={employeeToEdit}
        onClose={() => {
          setIsFormModalOpen(false);
          setEmployeeToEdit(null);
        }}
        onSuccess={() => {
          setIsFormModalOpen(false);
          setEmployeeToEdit(null);
          refetch();
          queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
        }}
      />
    </AppLayout>
  );
}
