import { getTranslations } from "next-intl/server";

import VerifyAccountForm from "@/components/auth/verify-account/verify-account-form";

export async function generateMetadata() {
  const t = await getTranslations("VerifyAccount");

  return {
    title: t("title"),
  };
}

export default function VerifyAccount() {
  return <VerifyAccountForm />;
}
