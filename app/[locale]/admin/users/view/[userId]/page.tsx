import { getTranslations } from "next-intl/server";

import UserDetails from "@/components/users/user-details";

export async function generateMetadata() {
  const t = await getTranslations("Users");
  const tCommon = await getTranslations("Common");

  return {
    title: `${tCommon("view")} ${t("user")}`,
  };
}

export default function ViewUser() {
  return <UserDetails />;
}
