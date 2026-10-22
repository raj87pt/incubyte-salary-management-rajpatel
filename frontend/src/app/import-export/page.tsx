"use client";

import React, { useState } from "react";
import {
  Card,
  Upload,
  Button,
  message,
  Alert,
  Divider,
  List,
  Typography,
} from "antd";
import {
  InboxOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";

import { api } from "@/lib/api";
import { CSVImportResult } from "@/types";
import AppLayout from "@/components/layout/AppLayout";
import styles from "./page.module.scss";

const { Dragger } = Upload;
const { Text } = Typography;

export default function ImportExportPage() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<CSVImportResult | null>(null);

  const handleDownloadTemplate = () => {
    const headers = [
      "employee_id",
      "first_name",
      "last_name",
      "email",
      "department",
      "designation",
      "country",
      "city",
      "gender",
      "date_of_birth",
      "date_of_joining",
      "employment_type",
      "status",
      "base_salary",
      "currency",
      "salary_effective_date",
    ].join(",");

    const sampleRow = [
      "EMP-EXAMPLE-1",
      "Alex",
      "Morgan",
      "alex.m@acme.org",
      "Engineering",
      "Staff Engineer",
      "United States",
      "Seattle",
      "Female",
      "1990-05-15",
      "2021-03-01",
      "full-time",
      "active",
      "155000",
      "USD",
      "2023-01-01",
    ].join(",");

    const csvContent = "data:text/csv;charset=utf-8," + `${headers}\n${sampleRow}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "employee_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadFullExport = () => {
    window.open(api.getExportUrl(), "_blank");
  };

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    accept: ".csv",
    showUploadList: false,
    customRequest: async (options) => {
      const { file, onSuccess, onError } = options;
      setImporting(true);
      setResult(null);
      try {
        const res = await api.importCsv(file as File);
        setResult(res);
        if (res.imported > 0) {
          message.success(`Successfully imported ${res.imported} employee records!`);
        }
        if (res.failed > 0) {
          message.warning(`${res.failed} records could not be imported.`);
        }
        onSuccess?.(res);
      } catch (err: any) {
        message.error("Failed to process CSV file.");
        onError?.(err);
      } finally {
        setImporting(false);
      }
    },
  };

  return (
    <AppLayout>
      <div className={styles.container}>
        {/* Top Header */}
        <div className={styles.topBar}>
          <h1 className={styles.mainTitle}>Bulk CSV Import & Export Hub</h1>
          <p className={styles.subtitle}>
            Seamlessly bridge spreadsheet workflows by importing new payroll batches or exporting full records for offline analysis.
          </p>
        </div>

        <Alert
          message="Excel Workflow Replacement"
          description="This tool directly replaces manual spreadsheet management. All uploaded records are validated against schema constraints and automatically normalized to the base currency (USD)."
          type="info"
          showIcon
        />

        <div className={styles.cardsGrid}>
          {/* Import Card */}
          <Card className={styles.card}>
            <div className={styles.cardTitle}>Upload Employee CSV</div>
            <div className={styles.cardDesc}>
              Upload a UTF-8 encoded CSV file containing employee and salary records. New records will be inserted and existing IDs will be reported.
            </div>

            <div className={styles.uploadZone}>
              <Dragger {...uploadProps} disabled={importing}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ color: "#1677ff", fontSize: 48 }} />
                </p>
                <p className="ant-upload-text">
                  Click or drag CSV file to this area to import
                </p>
                <p className="ant-upload-hint">
                  Supports bulk batches with up to 10,000 rows. Files must include standard column headers.
                </p>
              </Dragger>
            </div>

            <div style={{ marginTop: 16 }}>
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleDownloadTemplate}
              >
                Download CSV Sample Template
              </Button>
            </div>

            {/* Import Summary */}
            {result && (
              <div className={styles.resultBox}>
                <h4>Import Summary</h4>
                <div className={styles.statRow}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Processed</span>
                    <span className={styles.statVal}>{result.total_rows}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel} style={{ color: "#16a34a" }}>
                      Imported
                    </span>
                    <span className={styles.statVal} style={{ color: "#16a34a" }}>
                      <CheckCircleOutlined /> {result.imported}
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel} style={{ color: "#dc2626" }}>
                      Failed
                    </span>
                    <span className={styles.statVal} style={{ color: "#dc2626" }}>
                      <CloseCircleOutlined /> {result.failed}
                    </span>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div>
                    <Divider style={{ margin: "12px 0" }} />
                    <Text type="danger" strong>
                      Import Warnings & Errors:
                    </Text>
                    <List
                      size="small"
                      dataSource={result.errors}
                      renderItem={(err) => <List.Item>{err}</List.Item>}
                      style={{ maxHeight: 180, overflowY: "auto", marginTop: 8 }}
                    />
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Export Card */}
          <Card className={styles.card}>
            <div className={styles.cardTitle}>Export Employee Salary Data</div>
            <div className={styles.cardDesc}>
              Export all 10,000 employee records with compensation, department, country, and status fields to an open CSV spreadsheet format.
            </div>

            <div style={{ margin: "32px 0", textAlign: "center" }}>
              <Button
                type="primary"
                size="large"
                icon={<DownloadOutlined />}
                onClick={handleDownloadFullExport}
              >
                Download Full Database (CSV)
              </Button>
            </div>

            <div style={{ background: "#f8fafc", padding: 16, borderRadius: 8 }}>
              <h5 style={{ marginBottom: 6 }}>Export Specifications:</h5>
              <ul style={{ paddingLeft: 20, color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>
                <li>Contains all 16 employee & compensation fields</li>
                <li>UTF-8 encoded, comma-separated values</li>
                <li>Instant download directly generated by FastAPI backend stream</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
