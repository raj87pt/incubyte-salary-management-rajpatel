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
            // Curated Palette integration
            colorPrimary: "#003049", // Deep Space Blue
            colorInfo: "#669bbc",    // Steel Blue
            colorError: "#c1121f",   // Flag Red
            colorWarning: "#780000", // Molten Lava
            colorSuccess: "#15803d",
            borderRadius: 8,
            fontFamily:
              "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          },
          components: {
            Button: {
              primaryColor: "#ffffff",
              colorPrimary: "#003049",
              colorPrimaryHover: "#669bbc",
              colorPrimaryActive: "#002035",
            },
            Menu: {
              darkItemBg: "transparent",
              darkItemSelectedBg: "#669bbc",
              darkItemSelectedColor: "#ffffff",
            },
            Table: {
              headerBg: "#f8fafc",
              headerColor: "#003049",
              rowHoverBg: "#fdf0d5", // Papaya Whip soft warm row hover!
              borderColor: "#e2e8f0",
            },
            Card: {
              headerBg: "#ffffff",
            },
            Tag: {
              defaultBg: "#e8f1f5",
              defaultColor: "#003049",
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </QueryClientProvider>
  );
}
