"use client";

import React, { useEffect } from "react";

import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useNotificationConnection } from "@/hooks/useNotificationConnection";
import AppSidebar from "@/components/navigation/app-sidebar";
import Backdrop from "@/components/navigation/backdrop";
import AppHeader from "@/components/navigation/app-header";
import { useSidebarStore } from "@/stores/useSidebarStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthStatus();
  useNotificationConnection();

  const { isExpanded, isHovered, isMobileOpen, setIsMobile } =
    useSidebarStore();

  // Manejo de resize para detectar mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // inicial
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [setIsMobile]);

  // Dynamic class para el margen del contenido
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[250px]"
      : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto w-full">{children}</div>
      </div>
    </div>
  );
}
