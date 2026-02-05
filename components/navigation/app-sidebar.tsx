"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IconChartPie,
  IconChevronDown,
  IconDots,
  IconKey,
  IconUsersGroup,
  IconZoomExclamation,
  IconDeviceDesktopCog,
} from "@tabler/icons-react";

import { usePathname } from "@/i18n/navigation";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useTranslations } from "next-intl";

type SubItem = {
  name: string;
  path: string;
  icon?: React.ReactNode;
  pro?: boolean;
  new?: boolean;
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubItem[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } =
    useSidebarStore();
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  const navItems: NavItem[] = [
    {
      icon: <IconChartPie />,
      name: t("links.dashboard"),
      path: "/admin",
    },
    {
      icon: <IconDeviceDesktopCog />,
      name: t("links.management.main"),
      subItems: [
        {
          name: t("links.management.users"),
          path: "/admin/users",
          icon: <IconUsersGroup />,
        },
        {
          name: t("links.management.roles"),
          path: "/admin/roles",
          icon: <IconKey />,
        },
        {
          name: t("links.management.traces"),
          path: "/admin/traces",
          icon: <IconZoomExclamation />,
        },
      ],
    },
  ];
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string, exact: boolean = false) =>
      exact ? pathname === path : pathname.startsWith(path),
    [pathname],
  );

  useEffect(() => {
    let matchedIndex: number | null = null;
    navItems.forEach((nav, index) => {
      nav.subItems?.forEach((subItem) => {
        if (isActive(subItem.path)) {
          matchedIndex = index;
        }
      });
    });
    setOpenSubmenu(matchedIndex);
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `submenu-${openSubmenu}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  const renderMenuItems = (items: typeof navItems) => (
    <ul className="flex flex-col gap-2">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              className={`menu-item group flex items-center gap-2 ml-1 w-full ${
                openSubmenu === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              }`}
              onClick={() => handleSubmenuToggle(index)}
            >
              <span
                className={
                  openSubmenu === index
                    ? "menu-item-icon-active flex-shrink-0"
                    : "menu-item-icon-inactive flex-shrink-0"
                }
              >
                {nav.icon}
              </span>
              <span
                className={`menu-item-text truncate whitespace-nowrap transition-opacity duration-200 delay-300 ${
                  isExpanded || isHovered || isMobileOpen
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              >
                {nav.name}
              </span>
              <IconChevronDown
                className={`ml-auto w-5 h-5 transition-transform duration-300 ${
                  openSubmenu === index ? "rotate-180 text-brand-500" : ""
                } ${isExpanded || isHovered || isMobileOpen ? "opacity-100 delay-300" : "opacity-0"}`}
              />
            </button>
          ) : (
            nav.path && (
              <Link
                className={`menu-item group flex items-center m-1 gap-2 w-full ${
                  isActive(nav.path, true)
                    ? "text-[#006FEE]"
                    : "menu-item-inactive"
                }`}
                href={nav.path}
              >
                <span
                  className={
                    isActive(nav.path, true)
                      ? "menu-item-icon-active flex-shrink-0"
                      : "menu-item-icon-inactive flex-shrink-0"
                  }
                >
                  {nav.icon}
                </span>
                <span
                  className={`menu-item-text truncate whitespace-nowrap transition-opacity duration-200 delay-300 ${
                    isExpanded || isHovered || isMobileOpen
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                >
                  {nav.name}
                </span>
              </Link>
            )
          )}

          {nav.subItems && (
            <div
              ref={(el) => {
                subMenuRefs.current[`submenu-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu === index
                    ? `${subMenuHeight[`submenu-${index}`]}px`
                    : "0px",
              }}
            >
              <ul
                className={`mt-2 space-y-1 ${isExpanded || isHovered || isMobileOpen ? "ml-9" : "ml-1"}`}
              >
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      className={`menu-dropdown-item flex items-center gap-2 ${
                        isActive(subItem.path)
                          ? "text-[#006FEE]"
                          : "menu-dropdown-item-inactive"
                      }`}
                      href={subItem.path}
                    >
                      {subItem.icon && (
                        <span className="flex-shrink-0">{subItem.icon}</span>
                      )}
                      <span
                        className={`truncate whitespace-nowrap transition-opacity duration-200 delay-300 ${
                          isExpanded || isHovered || isMobileOpen
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      >
                        {subItem.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 left-0 h-screen transition-transform duration-300 ease-in-out
                  bg-white dark:bg-[#18181b] dark:text-white
                  border-r border-gray-200 dark:border-[#3f3f46]
                  overflow-y-auto overflow-x-hidden
                  z-50
                  ${isExpanded || isMobileOpen ? "w-[250px]" : isHovered ? "w-[250px]" : "w-[90px]"}
                  ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
                  lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className="flex py-6 justify-start px-5">
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <Image alt="Logo" height={40} src="/next.svg" width={150} />
          ) : (
            <Image alt="Logo" height={32} src="/favicon.ico" width={32} />
          )}
        </Link>
      </div>

      {/* Menu */}
      <div className="flex flex-col overflow-y-auto no-scrollbar px-5">
        <nav className="mb-6">
          <h2 className="mb-4 pl-1 text-xs uppercase leading-[20px] text-gray-400 flex items-center">
            {isExpanded || isHovered || isMobileOpen ? "Menu" : <IconDots />}
          </h2>
          {renderMenuItems(navItems)}
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
