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
            // Executive Corporate Palette
            colorPrimary: "#1e3a8a", // Deep Navy
            colorInfo: "#0284c7",    // Slate Blue
            colorSuccess: "#059669", // Rich Emerald Green
            colorWarning: "#d97706", // Warm Amber
            colorError: "#dc2626",   // Crimson
            borderRadius: 10,
            fontFamily:
              "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            colorText: "#0f172a",    // Dark Charcoal
            colorTextSecondary: "#475569",
            colorBorder: "#e2e8f0",
            colorBgContainer: "#ffffff", // Pure White
            colorBgLayout: "#f1f5f9",    // Cool Grey
          },
          components: {
            Button: {
              primaryColor: "#ffffff",
              colorPrimary: "#1e3a8a",
              colorPrimaryHover: "#1e40af",
              colorPrimaryActive: "#172554",
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
              activeBorderColor: "#1e3a8a",
              hoverBorderColor: "#3b82f6",
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
