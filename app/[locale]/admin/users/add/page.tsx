import { getTranslations } from "next-intl/server";

import ManageUser from "@/components/users/manage-user";

export async function generateMetadata() {
  const t = await getTranslations("Users");
  const tCommon = await getTranslations("Common");

  return {
    title: `${tCommon("add")} ${t("user")}`,
  };
}

export default function AddUser() {
  return <ManageUser />;
}
