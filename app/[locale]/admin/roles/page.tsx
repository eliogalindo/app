import { getTranslations } from "next-intl/server";

import RolesList from "@/components/roles/roles-list";

export async function generateMetadata() {
  const t = await getTranslations("Roles");

  return {
    title: t("title"),
  };
}
export default function Roles() {
  return <RolesList />;
}
