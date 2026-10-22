/**
 * Axios API client for interacting with the FastAPI backend.
 */

import axios from "axios";
import {
  Employee,
  EmployeeDetail,
  EmployeeFilterParams,
  PaginatedResponse,
  SalaryRevision,
  DashboardMetrics,
  DepartmentStat,
  CountryStat,
  SalaryBucket,
  CSVImportResult,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = {
  // Employee endpoints
  getEmployees: async (params?: EmployeeFilterParams): Promise<PaginatedResponse<Employee>> => {
    const res = await apiClient.get<PaginatedResponse<Employee>>("/api/v1/employees", {
      params,
    });
    return res.data;
  },

  getEmployee: async (id: string): Promise<Employee> => {
    const res = await apiClient.get<Employee>(`/api/v1/employees/${id}`);
    return res.data;
  },

  getEmployeeDetails: async (id: string): Promise<EmployeeDetail> => {
    const res = await apiClient.get<EmployeeDetail>(`/api/v1/employees/${id}/details`);
    return res.data;
  },

  createEmployee: async (payload: Partial<Employee>): Promise<Employee> => {
    const res = await apiClient.post<Employee>("/api/v1/employees", payload);
    return res.data;
  },

  updateEmployee: async (id: string, payload: any): Promise<Employee> => {
    const res = await apiClient.put<Employee>(`/api/v1/employees/${id}`, payload);
    return res.data;
  },

  deleteEmployee: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/employees/${id}`);
  },

  getSalaryHistory: async (id: string): Promise<SalaryRevision[]> => {
    const res = await apiClient.get<SalaryRevision[]>(`/api/v1/employees/${id}/salary-history`);
    return res.data;
  },

  // CSV operations
  getExportUrl: (): string => {
    return `${API_BASE_URL}/api/v1/employees/export`;
  },

  importCsv: async (file: File): Promise<CSVImportResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post<CSVImportResult>("/api/v1/employees/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  // Analytics endpoints
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const res = await apiClient.get<DashboardMetrics>("/api/v1/analytics/dashboard");
    return res.data;
  },

  getDepartmentStats: async (): Promise<DepartmentStat[]> => {
    const res = await apiClient.get<DepartmentStat[]>("/api/v1/analytics/departments");
    return res.data;
  },

  getCountryStats: async (): Promise<CountryStat[]> => {
    const res = await apiClient.get<CountryStat[]>("/api/v1/analytics/countries");
    return res.data;
  },

  getSalaryDistribution: async (): Promise<SalaryBucket[]> => {
    const res = await apiClient.get<SalaryBucket[]>("/api/v1/analytics/salary-distribution");
    return res.data;
  },
};
