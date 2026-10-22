"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { ConfigProvider, theme } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
  toggleCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false);

  // Sync collapsed state with localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("payvantage_sidebar_collapsed");
      if (saved !== null) {
        setCollapsedState(saved === "true");
      }
    } catch (e) {
      // localStorage may fail in restricted environments
    }
  }, []);

  const setCollapsed = (val: boolean) => {
    setCollapsedState(val);
    try {
      localStorage.setItem("payvantage_sidebar_collapsed", String(val));
    } catch (e) {}
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

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
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggleCollapsed }}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              // Modern Indigo / Slate Executive Palette
              colorPrimary: "#4f46e5", // Electric Indigo
              colorInfo: "#0284c7",    // Slate Sky
              colorSuccess: "#10b981", // Emerald
              colorWarning: "#f59e0b", // Amber
              colorError: "#f43f5e",   // Rose
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
                colorPrimary: "#4f46e5",
                colorPrimaryHover: "#4338ca",
                colorPrimaryActive: "#3730a3",
                borderRadius: 8,
                controlHeight: 38,
                fontWeight: 600,
              },
              Menu: {
                darkItemBg: "transparent",
                darkItemSelectedBg: "#4f46e5",
                darkItemSelectedColor: "#ffffff",
                itemBorderRadius: 8,
              },
              Table: {
                headerBg: "#f8fafc",
                headerColor: "#334155",
                rowHoverBg: "rgba(79, 70, 229, 0.04)", // Subtle indigo mist hover
                borderColor: "#f1f5f9",
                borderRadius: 12,
              },
              Card: {
                headerBg: "#ffffff",
                borderRadiusLG: 14,
              },
              Tag: {
                defaultBg: "#f1f5f9",
                defaultColor: "#334155",
                borderRadiusSM: 6,
              },
              Input: {
                borderRadius: 8,
                activeBorderColor: "#4f46e5",
                hoverBorderColor: "#818cf8",
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
    </SidebarContext.Provider>
  );
}
