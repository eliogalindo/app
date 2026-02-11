"use client";
import React from "react";

import { useSidebarStore } from "@/stores/sidebarStore";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebarStore();

  if (!isMobileOpen) return null;

  return (
    <div
      aria-label="Close sidebar"
      className="fixed inset-0 z-20 bg-gray-900/50 lg:hidden transition-opacity duration-300"
      role="button"
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;
