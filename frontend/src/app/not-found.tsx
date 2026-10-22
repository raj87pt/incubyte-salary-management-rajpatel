"use client";

import React from "react";
import Link from "next/link";
import { Button, Result, Card } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import AppLayout from "@/components/layout/AppLayout";

export default function NotFound() {
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
            maxWidth: 580,
            width: "100%",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 20px rgba(0, 48, 73, 0.05)",
            textAlign: "center",
            padding: 24,
          }}
        >
          <Result
            status="404"
            title="404 - Page Not Found"
            subTitle="The requested page does not exist or has been relocated within the PayVantage Enterprise Portal."
            extra={
              <Link href="/" passHref legacyBehavior>
                <Button type="primary" size="large" icon={<HomeOutlined />}>
                  Return to Compensation Dashboard
                </Button>
              </Link>
            }
          />
        </Card>
      </div>
    </AppLayout>
  );
}
