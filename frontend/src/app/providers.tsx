"use client";

import React, { useState } from "react";
import { ConfigProvider, theme } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // 30 seconds
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            // Modern Enterprise Fintech Palette
            colorPrimary: "#2563eb", // Royal Sapphire Blue
            colorInfo: "#0284c7",    // Sky
            colorSuccess: "#059669", // Emerald
            colorWarning: "#d97706", // Amber
            colorError: "#e11d48",   // Rose Crimson
            borderRadius: 10,
            fontFamily:
              "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            colorText: "#0f172a",
            colorTextSecondary: "#475569",
            colorBorder: "#e2e8f0",
            colorBgContainer: "#ffffff",
            colorBgLayout: "#f8fafc",
          },
          components: {
            Button: {
              primaryColor: "#ffffff",
              colorPrimary: "#2563eb",
              colorPrimaryHover: "#1d4ed8",
              colorPrimaryActive: "#1e40af",
              borderRadius: 8,
              controlHeight: 38,
              fontWeight: 600,
            },
            Table: {
              headerBg: "#f8fafc",
              headerColor: "#334155",
              rowHoverBg: "#f1f5f9",
              borderColor: "#f1f5f9",
              borderRadius: 14,
            },
            Card: {
              headerBg: "#ffffff",
              borderRadiusLG: 16,
            },
            Tag: {
              defaultBg: "#f1f5f9",
              defaultColor: "#334155",
              borderRadiusSM: 6,
            },
            Input: {
              borderRadius: 8,
              activeBorderColor: "#2563eb",
              hoverBorderColor: "#60a5fa",
            },
            Select: {
              borderRadius: 8,
            },
            Modal: {
              borderRadiusLG: 16,
            },
            Drawer: {
              borderRadiusLG: 16,
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </QueryClientProvider>
  );
}
