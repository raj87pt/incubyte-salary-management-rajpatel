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

import Logo from "@/components/common/Logo";
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
          {/* Brand Identity with Logo */}
          <div className={styles.brandGroup} onClick={() => router.push("/")}>
            <Logo size={36} />
            <div className={styles.brandMeta}>
              <span className={styles.brandName}>PayVantage</span>
              <span className={styles.brandOrgBadge}>
                Enterprise Suite <span className={styles.brandDot}>•</span> Global
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
