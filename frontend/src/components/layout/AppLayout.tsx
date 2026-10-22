"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Avatar, Badge, Button } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  CloudUploadOutlined,
  UserOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

import styles from "./AppLayout.module.scss";

const { Header, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      description: "Compensation Overview",
    },
    {
      key: "/employees",
      icon: <TeamOutlined />,
      label: "Directory",
      description: "10,000 Employees",
    },
    {
      key: "/import-export",
      icon: <CloudUploadOutlined />,
      label: "Data Hub",
      description: "CSV Import & Export",
    },
  ];

  const selectedKey = pathname === "/" ? "/" : `/${pathname.split("/")[1]}`;

  return (
    <Layout className={styles.layoutWrapper}>
      {/* Top Application Navbar */}
      <Header className={styles.navbar}>
        <div className={styles.navContainer}>
          {/* Brand Identity */}
          <div className={styles.brandGroup} onClick={() => router.push("/")}>
            <div className={styles.brandIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  fill="url(#brandGrad1)"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="url(#brandGrad2)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="url(#brandGrad1)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="brandGrad1" x1="2" y1="2" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#1d4ed8" />
                  </linearGradient>
                  <linearGradient id="brandGrad2" x1="2" y1="17" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#10b981" />
                    <stop offset="1" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className={styles.brandMeta}>
              <span className={styles.brandName}>PayVantage</span>
              <span className={styles.brandOrgBadge}>
                ACME Corp <span className={styles.brandDot}>•</span> Global
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className={styles.navLinks}>
            {navItems.map((item) => {
              const isActive = selectedKey === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => router.push(item.key)}
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                >
                  <span className={styles.navItemIcon}>{item.icon}</span>
                  <div className={styles.navItemText}>
                    <span className={styles.navItemLabel}>{item.label}</span>
                  </div>
                  {isActive && <span className={styles.activeIndicator} />}
                </button>
              );
            })}
          </nav>

          {/* Right Header Status & User */}
          <div className={styles.navRight}>
            <div className={styles.statusChip}>
              <Badge status="processing" color="#10b981" />
              <span className={styles.statusText}>10,000 Records Active</span>
            </div>

            <div className={styles.profileBadge}>
              <Avatar
                className={styles.profileAvatar}
                icon={<UserOutlined />}
              />
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>Sarah Jenkins</span>
                <span className={styles.profileRole}>VP of Total Rewards</span>
              </div>
            </div>
          </div>
        </div>
      </Header>

      {/* Main Viewport Content Area */}
      <Content className={styles.contentWrapper}>
        <div className={styles.contentInner}>{children}</div>
      </Content>
    </Layout>
  );
}
