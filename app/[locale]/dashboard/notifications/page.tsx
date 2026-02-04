import { getTranslations } from "next-intl/server";

import NotificationsList from "@/components/notifications/notifications-list";

export async function generateMetadata() {
  const t = await getTranslations("Notifications");

  return {
    title: t("title"),
  };
}
export default function Notifications() {
  return <NotificationsList />;
}
