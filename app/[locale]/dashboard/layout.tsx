"use client";

import React from "react";

import Navbar from "@/components/ui/navbar";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useNotificationConnection } from "@/hooks/useNotificationConnection";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use the hooks to check auth status and connect to notifications
  useAuthStatus();
  useNotificationConnection();

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
