"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
  addToast,
  Avatar,
  Badge,
  Button,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import {
  IconBellRinging,
  IconDots,
  IconLogout,
  IconMenu2,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";

import LocaleSwitcher from "../ui/locale-switcher";

import defaultAvatar from "@/public/user.png";
import { Link, useRouter } from "@/i18n/navigation";
import { useNotificationStore } from "@/stores/notificationStore";
import { useAuthStore } from "@/stores/authStore";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import { authService } from "@/services/authService";
import { API_URL } from "@/constants";
import { ColorType } from "@/types";
import { ConnectionStatus } from "@/enums/connectionStatus";
import { NotificationType } from "@/enums/notificationType";
import { useSidebarStore } from "@/stores/sidebarStore";

const AppHeader: React.FC = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Navigation");
  const tNotification = useTranslations("Notifications");
  const tCommon = useTranslations("Common");
  const { notificationsSummary, connectionStatus } = useNotificationStore();
  const { authData, clearAuthData } = useAuthStore();
  const [statusValue, setStatusValue] = useState<ColorType>("warning");

  const statusColor: Record<NotificationType, ColorType> = {
    [NotificationType.Default]: "default",
    [NotificationType.Info]: "success",
    [NotificationType.System]: "warning",
  };

  const handleSignOut = async () => {
    const result = await authService.signOut();

    if (result?.ok) {
      clearAuthData();
      window.location.href = `/${locale}`;
      toast("success", t("messages.signOutSuccess"));
    } else {
      toast("danger", t("messages.signOutError"));
    }
  };

  const toast = (color: ColorType, description: string) =>
    addToast({
      description: description,
      color: color,

      timeout: 3000,
      shouldShowTimeoutProgress: true,
    });

  useEffect(() => {
    switch (connectionStatus) {
      case ConnectionStatus.reconnecting:
        setStatusValue("warning");
        break;
      case ConnectionStatus.connected:
        setStatusValue("success");
        break;
      case ConnectionStatus.disconnected:
        setStatusValue("danger");
        break;
    }
  }, [connectionStatus]);

  useEffect(() => {
    if (notificationsSummary?.recentNotifications) {
      const { recentNotifications } = notificationsSummary;

      recentNotifications.map((notification) => {
        addToast({
          title: tNotification("toastTitle"),
          description: notification.message,
          classNames: {
            base: cn([
              "bg-default-50 dark:bg-background shadow-sm",
              "border border-l-8 rounded-md rounded-l-none",
              "flex flex-col items-start",
            ]),
            icon: "w-6 h-6 fill-current",
          },
          endContent: (
            <div className="ms-11 my-2 flex gap-x-2">
              <Button
                color="default"
                size="sm"
                variant="bordered"
                onPress={() => router.push("/admin/notifications")}
              >
                {tCommon("view")}
              </Button>
            </div>
          ),
          color: statusColor[notification.type],
        });
      });
    }
  }, [notificationsSummary]);

  const BadgedElement = ({ children }: { children: React.ReactNode }) => {
    if (!notificationsSummary?.unreadCount) return children;

    const { unreadCount } = notificationsSummary;

    return (
      <Badge color="danger" content={unreadCount} shape="circle">
        {children}
      </Badge>
    );
  };
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(true);

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } =
    useSidebarStore();

  const handleToggle = () => {
    if (window?.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setApplicationMenuOpen(true);
      }
    };
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-45 dark:border-[#3f3f46] dark:bg-[#18181b] lg:border-b lg:rounded-b-xl">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <Button
            variant="light"
            size="sm"
            aria-label="Toggle Sidebar"
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-[#3f3f46] lg:flex dark:text-white lg:h-11 lg:w-11 lg:border"
            onPress={handleToggle}
          >
            {isMobileOpen ? <IconX /> : <IconMenu2 />}
          </Button>

          <Link className="lg:hidden" href="/">
            <Image
              alt="Logo"
              className="dark:hidden"
              height={32}
              src="/next.svg"
              width={154}
            />
            <Image
              alt="Logo"
              className="hidden dark:block"
              height={32}
              src="/next.svg"
              width={154}
            />
          </Link>

          <Button
            size="sm"
            variant="light"
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
            onPress={toggleApplicationMenu}
          >
            <IconDots />
          </Button>
        </div>
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } items-center justify-between w-full gap-4 px-5 py-4 shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <LocaleSwitcher />
          <div className="flex justify-between gap-4">
            <ThemeSwitch />
            <Dropdown placement="bottom-end">
              <Badge
                color={statusValue}
                content=""
                placement="bottom-left"
                shape="circle"
              >
                <BadgedElement>
                  <DropdownTrigger>
                    <Avatar
                      isBordered
                      as="button"
                      className="transition-transform"
                      color="default"
                      name="User"
                      size="sm"
                      src={
                        authData?.avatar
                          ? `${API_URL}/uploads/${authData?.avatar}`
                          : defaultAvatar.src
                      }
                    />
                  </DropdownTrigger>
                </BadgedElement>
              </Badge>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold"> {t("menu.signedInAs")}</p>
                  <p className="font-semibold">{authData?.email}</p>
                </DropdownItem>
                <DropdownItem key="settings" endContent={<IconUser />}>
                  {t("menu.profile")}
                </DropdownItem>
                <DropdownItem
                  key="notifications"
                  endContent={
                    <BadgedElement>
                      <IconBellRinging />
                    </BadgedElement>
                  }
                  onPress={() => router.push("/admin/notifications")}
                >
                  {t("menu.notifications")}
                </DropdownItem>
                <DropdownItem
                  key="signout"
                  color="danger"
                  endContent={<IconLogout />}
                  onPress={handleSignOut}
                >
                  {t("menu.signOut")}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
