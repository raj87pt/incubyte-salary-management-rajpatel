import React, { Suspense } from "react";
import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import Providers from "./providers";
import "./globals.scss";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PayVantage - Enterprise Compensation Intelligence",
  description:
    "Next-generation compensation intelligence and enterprise salary management platform for 10,000+ global employees.",
  icons: {
    icon: [
      { url: "/favicon.svg?v=3", type: "image/svg+xml" },
      { url: "/favicon.png?v=3", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico?v=3" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: "/favicon.png?v=3",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg?v=3" type="image/svg+xml" />
        <link rel="icon" href="/favicon.png?v=3" sizes="32x32" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
        <link rel="apple-touch-icon" href="/favicon.png?v=3" />
      </head>
      <body>
        <AntdRegistry>
          <Providers>
            <Suspense fallback={null}>{children}</Suspense>
          </Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
