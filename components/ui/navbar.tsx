import React, { useEffect, useState } from "react";
import {
  addToast,
  Avatar,
  Badge,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Button,
} from "@heroui/react";
import { IconBellRinging, IconLogout, IconUser } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";

import { Logo } from "./icons";

import defaultAvatar from "@/public/user.png";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useNotificationStore } from "@/stores/notificationStore";
import { useAuthStore } from "@/stores/authStore";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import { authService } from "@/services/authService";
import { API_URL } from "@/constants";
import LocaleSwitcher from "@/components/ui/locale-switcher";
import { ColorType } from "@/types";
import { ConnectionStatus } from "@/enums/connectionStatus";
import { NotificationType } from "@/enums/notificationType";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const t = useTranslations("Navbar");
  const tNotification = useTranslations("Notifications");
  const tCommon = useTranslations("Common");
  const { notificationsSummary, connectionStatus } = useNotificationStore();
  const { authData, clearAuthData } = useAuthStore();
  const menuItems = [t("links.dashboard"), t("links.roles"), t("links.users")];
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
      toast("success", t("messages.signOutError"));
    } else {
      toast("danger", t("messages.signOutError"));
    }
  };

  const toast = (color: ColorType, description: string) =>
    addToast({
      color: color,
      description: description,
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
                onPress={() => router.push("/dashboard/notifications")}
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

  return (
    <HeroUINavbar onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent className="gap-2" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Logo />
          <p className="hidden sm:block font-bold text-inherit">{t("brand")}</p>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent className="hidden sm:flex gap-4">
        <NavbarItem isActive={pathname === "/dashboard"}>
          <Link
            color={pathname === "/dashboard" ? "primary" : "foreground"}
            href={"/dashboard"}
          >
            {t("links.dashboard")}
          </Link>
        </NavbarItem>
        <NavbarItem isActive={pathname.includes("/dashboard/roles")}>
          <Link
            aria-current="page"
            color={
              pathname.includes("/dashboard/roles") ? "primary" : "foreground"
            }
            href={"/dashboard/roles"}
          >
            {t("links.roles")}
          </Link>
        </NavbarItem>
        <NavbarItem isActive={pathname.includes("/dashboard/users")}>
          <Link
            color={
              pathname.includes("/dashboard/users") ? "primary" : "foreground"
            }
            href={"/dashboard/users"}
          >
            {t("links.users")}
          </Link>
        </NavbarItem>
        <NavbarItem isActive={pathname.includes("/dashboard/traces")}>
          <Link
            color={
              pathname.includes("/dashboard/traces") ? "primary" : "foreground"
            }
            href={"/dashboard/traces"}
          >
            {t("links.traces")}
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent className="gap-2" justify="end">
        <LocaleSwitcher />
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
              onPress={() => router.push("/dashboard/notifications")}
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
      </NavbarContent>
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full"
              color={index === 2 ? "primary" : "foreground"}
              href="#"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </HeroUINavbar>
  );
}
