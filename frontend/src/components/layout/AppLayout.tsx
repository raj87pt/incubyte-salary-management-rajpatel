"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Menu, Avatar, Badge } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  CloudUploadOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { useSidebar } from "@/app/providers";
import styles from "./AppLayout.module.scss";

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined className={styles.menuIcon} />,
      label: "Compensation Dashboard",
    },
    {
      key: "/employees",
      icon: <TeamOutlined className={styles.menuIcon} />,
      label: "Employee Directory",
    },
    {
      key: "/import-export",
      icon: <CloudUploadOutlined className={styles.menuIcon} />,
      label: "Bulk Import / Export",
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  const selectedKey = pathname === "/" ? "/" : `/${pathname.split("/")[1]}`;

  return (
    <Layout className={styles.layoutWrapper}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={270}
        collapsedWidth={80}
        className={styles.sider}
      >
        <div
          className={`${styles.brandLogo} ${
            collapsed ? styles.brandLogoCollapsed : ""
          }`}
        >
          <div className={styles.logoIcon}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="url(#pv_grad_1)"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="url(#pv_grad_2)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="url(#pv_grad_3)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="pv_grad_1" x1="2" y1="2" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#a5b4fc" />
                  <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="pv_grad_2" x1="2" y1="17" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38bdf8" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="pv_grad_3" x1="2" y1="12" x2="22" y2="17" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#818cf8" />
                  <stop offset="1" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          {!collapsed && (
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>PayVantage</span>
              <span className={styles.brandSubtitle}>Compensation Suite</span>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          className={`${styles.menuContainer} ${
            collapsed ? styles.menuCollapsed : ""
          }`}
        />

        {!collapsed && (
          <div className={styles.sidebarFooter}>
            <div className={styles.systemStatusPill}>
              <span className={styles.statusPulse} />
              <div className={styles.statusInfo}>
                <span className={styles.statusLabel}>ACME Corp · Prod</span>
                <span className={styles.statusSub}>10,000 Staff Active</span>
              </div>
            </div>
          </div>
        )}
      </Sider>

      <Layout className={styles.mainLayout}>
        <Header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.environmentBadge}>
              <Badge status="processing" color="#10b981" />
              <span>Database Connected</span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.userBadge}>
              <Avatar
                className={styles.userAvatar}
                icon={<UserOutlined />}
              />
              <div className={styles.userDetails}>
                <div className={styles.userName}>Sarah Jenkins</div>
                <div className={styles.userRole}>Chief People Officer (HR)</div>
              </div>
            </div>
          </div>
        </Header>

        <Content className={styles.contentArea}>
          <div className={styles.contentInner}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}
