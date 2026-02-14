"use client";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
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
import { useAuthStore } from "@/stores/authStore";

type SubItem = {
  name: string;
  path: string;
  icon?: React.ReactNode;
  permissions?: string[]; // Required permissions for this sub-item (optional, can be public if not provided)
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubItem[];
  permissions?: string[];
};

const AppSidebar: React.FC = () => {
  // 1. Stores
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } =
    useSidebarStore();
  const { authData } = useAuthStore(); // Gets the user from the persisted store

  const pathname = usePathname();
  const t = useTranslations("Navigation");

  // 2. Helper function to check permissions
  const hasPermission = useCallback(
    (requiredPermissions?: string[]) => {
      // If it doesn't require permissions, it's public
      if (!requiredPermissions || requiredPermissions.length === 0) return true;

      // Deny access if there's no user data (not logged in)
      if (!authData) return false;

      if (!authData.permissions || !Array.isArray(authData.permissions))
        return false;

      // Returns true if the user has AT LEAST ONE of the required permissions
      return requiredPermissions.some((permission) =>
        authData.permissions.includes(permission),
      );
    },
    [authData],
  );

  // 3. Menu (Memoized)
  const navItemsRaw: NavItem[] = useMemo(
    () => [
      {
        icon: <IconChartPie />,
        name: t("links.dashboard"),
        path: "/admin",
      },
      {
        icon: <IconDeviceDesktopCog />,
        name: t("links.management.main"),
        // This father NavItem doesn't have permissions, but it will disappear if its children are filtered
        subItems: [
          {
            name: t("links.management.users"),
            path: "/admin/users",
            icon: <IconUsersGroup />,
            permissions: ["users.read"],
          },
          {
            name: t("links.management.roles"),
            path: "/admin/roles",
            icon: <IconKey />,
            permissions: ["roles.read"],
          },
          {
            name: t("links.management.traces"),
            path: "/admin/traces",
            icon: <IconZoomExclamation />,
            permissions: ["traces.read"],
          },
        ],
      },
    ],
    [t],
  );

  // 4. Recursive filtering logic based on permissions
  const filteredNavItems = useMemo(() => {
    // If there's no authData, we could return [] or only public routes.
    // The actual logic allows routes without defined 'permissions' even if there's no user.

    return navItemsRaw.filter((item) => {
      // A. Verify permissions for the parent item
      if (item.permissions && !hasPermission(item.permissions)) {
        return false;
      }

      // B. Verify children if they exist
      if (item.subItems) {
        const visibleSubItems = item.subItems.filter(
          (subItem) =>
            !subItem.permissions || hasPermission(subItem.permissions),
        );

        // After filtering, if there are no visible children, we hide the parent
        if (visibleSubItems.length === 0) {
          return false;
        }

        // Asign the filtered subItems to a new object to avoid mutating the original navItemsRaw
        item.subItems = visibleSubItems;
      }

      return true;
    });
  }, [navItemsRaw, hasPermission]); // Recalculate when authData changes (inside hasPermission)

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
    //Uses the filtered list to calculate the active menu
    filteredNavItems.forEach((nav, index) => {
      nav.subItems?.forEach((subItem) => {
        if (isActive(subItem.path)) {
          matchedIndex = index;
        }
      });
    });
    setOpenSubmenu(matchedIndex);
  }, [pathname, isActive, filteredNavItems]);

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

  const renderMenuItems = (items: NavItem[]) => (
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
                    ? "menu-item-icon-active shrink-0"
                    : "menu-item-icon-inactive shrink-0"
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
                      ? "menu-item-icon-active shrink-0"
                      : "menu-item-icon-inactive shrink-0"
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
                        <span className="shrink-0">{subItem.icon}</span>
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
                  z-30
                  ${isExpanded || isMobileOpen ? "w-62.5" : isHovered ? "w-62.5" : "w-22.5"}
                  ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
                  lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex py-6 justify-start px-5">
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <Image alt="Logo" height={40} src="/next.svg" width={150} />
          ) : (
            <Image alt="Logo" height={32} src="/favicon.ico" width={32} />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto no-scrollbar px-5">
        <nav className="mb-6">
          <h2 className="mb-4 pl-1 text-xs uppercase leading-5 text-gray-400 flex items-center">
            {isExpanded || isHovered || isMobileOpen ? "Menu" : <IconDots />}
          </h2>
          {/* Renders the filtered menu items */}
          {renderMenuItems(filteredNavItems)}
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
