import { getTranslations } from "next-intl/server";

import ManageRole from "@/components/roles/manage-role";

export async function generateMetadata() {
  const t = await getTranslations("Roles");
  const tCommon = await getTranslations("Common");

  return {
    title: `${tCommon("edit")} ${t("role")}`,
  };
}

export default function EditRole() {
  return <ManageRole />;
}
