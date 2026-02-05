"use client";
import { create } from "zustand";

type SidebarState = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  isMobile: boolean;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
  setIsMobile: (mobile: boolean) => void;
};

export const useSidebarStore = create<SidebarState>((set) => ({
  isExpanded: true,
  isMobileOpen: false,
  isHovered: false,
  activeItem: null,
  openSubmenu: null,
  isMobile: false,

  toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })),

  toggleMobileSidebar: () =>
    set((state) => ({ isMobileOpen: !state.isMobileOpen })),

  setIsHovered: (isHovered) => set({ isHovered }),

  setActiveItem: (item) => set({ activeItem: item }),

  toggleSubmenu: (item) =>
    set((state) => ({
      openSubmenu: state.openSubmenu === item ? null : item,
    })),

  setIsMobile: (mobile) =>
    set((state) => ({
      isMobile: mobile,
      isMobileOpen: mobile ? state.isMobileOpen : false,
    })),
}));
