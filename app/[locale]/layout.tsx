import React from "react";
import { NextIntlClientProvider } from "next-intl";
import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { varelaRoundLocal } from "@/config/fonts";

export const metadata: Metadata = {
  title: { template: "%s | ACME", default: "ACME" },
  description: "ACME Corp.",
  applicationName: "ACME",
  icons: {
    icon: "/favicon.ico",
  },
  // icons: [
  //   {
  //     media: "(prefers-color-scheme: light)",
  //     url: darkFavicon.src,
  //     type: "image/ico",
  //   },
  //   {
  //     media: "(prefers-color-scheme: dark)",
  //     url: lightFavicon.src,
  //     type: "image/ico",
  //   },
  // ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html suppressHydrationWarning lang={locale}>
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background antialiased",
          varelaRoundLocal.className,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <main className="container mx-auto px-2">
            <NextIntlClientProvider>{children}</NextIntlClientProvider>
          </main>
        </Providers>
      </body>
    </html>
  );
}
