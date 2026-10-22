"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button, Result, Space, Card } from "antd";
import { ReloadOutlined, HomeOutlined } from "@ant-design/icons";
import AppLayout from "@/components/layout/AppLayout";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <AppLayout>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
        }}
      >
        <Card
          style={{
            maxWidth: 600,
            width: "100%",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 20px rgba(0, 48, 73, 0.05)",
            textAlign: "center",
            padding: 24,
          }}
        >
          <Result
            status="500"
            title="Something went wrong"
            subTitle={
              error?.message ||
              "An unexpected error occurred while processing your request. Please retry or return to the dashboard."
            }
            extra={
              <Space size="middle">
                <Button
                  type="primary"
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={() => reset()}
                >
                  Try Again
                </Button>
                <Link href="/" passHref legacyBehavior>
                  <Button size="large" icon={<HomeOutlined />}>
                    Dashboard
                  </Button>
                </Link>
              </Space>
            }
          />
        </Card>
      </div>
    </AppLayout>
  );
}
