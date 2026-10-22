"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Alert,
  message,
} from "antd";
import dayjs from "dayjs";
import { Employee } from "@/types";
import { api } from "@/lib/api";
import styles from "./EmployeeFormModal.module.scss";

interface EmployeeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeToEdit?: Employee | null;
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
  { label: "United States (USD)", value: "United States", currency: "USD" },
  { label: "United Kingdom (GBP)", value: "United Kingdom", currency: "GBP" },
  { label: "Germany (EUR)", value: "Germany", currency: "EUR" },
  { label: "France (EUR)", value: "France", currency: "EUR" },
  { label: "Canada (CAD)", value: "Canada", currency: "CAD" },
  { label: "Australia (AUD)", value: "Australia", currency: "AUD" },
  { label: "India (INR)", value: "India", currency: "INR" },
  { label: "Singapore (SGD)", value: "Singapore", currency: "SGD" },
  { label: "Switzerland (CHF)", value: "Switzerland", currency: "CHF" },
  { label: "Japan (JPY)", value: "Japan", currency: "JPY" },
];

export default function EmployeeFormModal({
  open,
  onClose,
  onSuccess,
  employeeToEdit,
}: EmployeeFormModalProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [isSalaryChanged, setIsSalaryChanged] = useState(false);
  const isEdit = !!employeeToEdit;

  useEffect(() => {
    if (open) {
      if (employeeToEdit) {
        form.setFieldsValue({
          ...employeeToEdit,
          date_of_birth: employeeToEdit.date_of_birth
            ? dayjs(employeeToEdit.date_of_birth)
            : null,
          date_of_joining: employeeToEdit.date_of_joining
            ? dayjs(employeeToEdit.date_of_joining)
            : null,
          salary_effective_date: employeeToEdit.salary_effective_date
            ? dayjs(employeeToEdit.salary_effective_date)
            : dayjs(),
          salary_revision_reason: "",
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: "active",
          employment_type: "full-time",
          gender: "Female",
          country: "United States",
          currency: "USD",
          salary_effective_date: dayjs(),
          date_of_joining: dayjs(),
        });
      }
      setIsSalaryChanged(false);
    }
  }, [open, employeeToEdit, form]);

  const handleCountryChange = (countryName: string) => {
    const match = COUNTRIES.find((c) => c.value === countryName);
    if (match) {
      form.setFieldsValue({ currency: match.currency });
    }
  };

  const handleSalaryChange = (val: number | null) => {
    if (isEdit && employeeToEdit && val !== null) {
      setIsSalaryChanged(Number(val) !== Number(employeeToEdit.base_salary));
    }
  };

  const handleFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        date_of_birth: values.date_of_birth
          ? values.date_of_birth.format("YYYY-MM-DD")
          : undefined,
        date_of_joining: values.date_of_joining
          ? values.date_of_joining.format("YYYY-MM-DD")
          : undefined,
        salary_effective_date: values.salary_effective_date
          ? values.salary_effective_date.format("YYYY-MM-DD")
          : undefined,
      };

      if (isEdit && employeeToEdit) {
        await api.updateEmployee(employeeToEdit.id, payload);
        message.success("Employee updated successfully");
      } else {
        await api.createEmployee(payload);
        message.success("Employee created successfully");
      }
      onSuccess();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail || "Failed to save employee record";
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEdit ? `Edit Employee (${employeeToEdit?.employee_id})` : "Add New Employee"}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      width={720}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          status: "active",
          employment_type: "full-time",
          gender: "Female",
          currency: "USD",
        }}
      >
        <div className={styles.formGrid}>
          <Form.Item
            name="employee_id"
            label="Employee ID"
            rules={[{ required: true, message: "Please input employee ID" }]}
          >
            <Input placeholder="e.g. EMP-10001" disabled={isEdit} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Work Email"
            rules={[
              { required: true, message: "Please input email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="jane.doe@acme.org" />
          </Form.Item>

          <Form.Item
            name="first_name"
            label="First Name"
            rules={[{ required: true, message: "Please input first name" }]}
          >
            <Input placeholder="Jane" />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true, message: "Please input last name" }]}
          >
            <Input placeholder="Doe" />
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: "Please select department" }]}
          >
            <Select placeholder="Select department">
              {DEPARTMENTS.map((dept) => (
                <Select.Option key={dept} value={dept}>
                  {dept}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="designation"
            label="Role / Designation"
            rules={[{ required: true, message: "Please input role" }]}
          >
            <Input placeholder="e.g. Senior Software Engineer" />
          </Form.Item>

          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true, message: "Please select country" }]}
          >
            <Select
              placeholder="Select country"
              onChange={handleCountryChange}
            >
              {COUNTRIES.map((c) => (
                <Select.Option key={c.value} value={c.value}>
                  {c.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="city"
            label="City"
            rules={[{ required: true, message: "Please input city" }]}
          >
            <Input placeholder="San Francisco" />
          </Form.Item>

          <Form.Item
            name="base_salary"
            label="Annual Base Salary"
            rules={[{ required: true, message: "Please input base salary" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="120000"
              onChange={handleSalaryChange}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) =>
                value?.replace(/\$\s?|(,*)/g, "") as unknown as number
              }
            />
          </Form.Item>

          <Form.Item
            name="currency"
            label="Currency"
            rules={[{ required: true, message: "Please input currency" }]}
          >
            <Input placeholder="USD" />
          </Form.Item>

          <Form.Item
            name="salary_effective_date"
            label="Salary Effective Date"
            rules={[{ required: true, message: "Please select effective date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="date_of_joining"
            label="Date of Joining"
            rules={[{ required: true, message: "Please select joining date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="date_of_birth"
            label="Date of Birth"
            rules={[{ required: true, message: "Please select date of birth" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="employment_type" label="Employment Type">
            <Select>
              <Select.Option value="full-time">Full-time</Select.Option>
              <Select.Option value="part-time">Part-time</Select.Option>
              <Select.Option value="contract">Contract</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="gender" label="Gender">
            <Select>
              <Select.Option value="Female">Female</Select.Option>
              <Select.Option value="Male">Male</Select.Option>
              <Select.Option value="Non-binary">Non-binary</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>
        </div>

        {/* Audit Trail Prompt when Salary Changes during Edit */}
        {isEdit && isSalaryChanged && (
          <div className={styles.fullWidth} style={{ marginTop: 12 }}>
            <Alert
              title="Salary Modification Detected"
              description="A historical salary revision audit record will be logged automatically. Please state the justification for this change."
              type="info"
              showIcon
              className={styles.revisionAlert}
            />
            <Form.Item
              name="salary_revision_reason"
              label="Reason for Salary Revision"
              rules={[
                {
                  required: true,
                  message: "Please enter the reason for modifying the salary",
                },
              ]}
            >
              <Input placeholder="e.g. Annual Merit Promotion / Market Equity Adjustment" />
            </Form.Item>
          </div>
        )}
      </Form>
    </Modal>
  );
}
