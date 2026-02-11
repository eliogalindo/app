import { getTranslations } from "next-intl/server";

import UsersList from "@/components/users/users-list";

export async function generateMetadata() {
  const t = await getTranslations("Users");

  return {
    title: t("title"),
  };
}

export default function Users() {
  return <UsersList />;
}
