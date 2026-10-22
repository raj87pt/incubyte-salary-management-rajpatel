"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Menu, Avatar } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  CloudUploadOutlined,
  UserOutlined,
} from "@ant-design/icons";

import styles from "./AppLayout.module.scss";

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Compensation Dashboard",
    },
    {
      key: "/employees",
      icon: <TeamOutlined />,
      label: "Employee Directory",
    },
    {
      key: "/import-export",
      icon: <CloudUploadOutlined />,
      label: "Bulk Import / Export",
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  // Determine active menu item
  const selectedKey = pathname === "/" ? "/" : `/${pathname.split("/")[1]}`;

  return (
    <Layout className={styles.layoutWrapper}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={260}
        className={styles.sider}
      >
        <div className={styles.brandLogo}>
          <div className={styles.logoIcon}>$</div>
          {!collapsed && (
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>SalaryBox</span>
              <span className={styles.brandSubtitle}>ACME HR Portal</span>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          className={styles.menuContainer}
        />
      </Sider>

      <Layout className={styles.mainLayout}>
        <Header className={styles.header}>
          <div className={styles.headerLeft} />

          <div className={styles.headerRight}>
            <div className={styles.userBadge}>
              <Avatar
                style={{ backgroundColor: "#003049" }}
                icon={<UserOutlined />}
              />
              <div>
                <div className={styles.userName}>Sarah Jenkins</div>
                <div className={styles.userRole}>Chief People Officer (HR)</div>
              </div>
            </div>
          </div>
        </Header>

        <Content className={styles.mainContent}>{children}</Content>
      </Layout>
    </Layout>
  );
}
