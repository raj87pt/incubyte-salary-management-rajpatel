import React, { Suspense } from "react";
import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import Providers from "./providers";
import "./globals.scss";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PayVantage — Enterprise Compensation Intelligence",
  description:
    "Next-generation compensation intelligence and enterprise salary management platform for 10,000+ global employees.",
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
