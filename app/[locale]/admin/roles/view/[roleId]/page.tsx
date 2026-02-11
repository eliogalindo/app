import { getTranslations } from "next-intl/server";

import RoleDetails from "@/components/roles/role-details";

export async function generateMetadata() {
  const t = await getTranslations("Roles");
  const tCommon = await getTranslations("Common");

  return {
    title: `${tCommon("view")} ${t("role")}`,
  };
}

export default function ViewRole() {
  return <RoleDetails />;
}
