import { getTranslations } from "next-intl/server";

import VerifyCodeForm from "@/components/auth/verify-code/verify-code-form";

export async function generateMetadata() {
  const t = await getTranslations("VerifyCode");

  return {
    title: t("title"),
  };
}

export default function VerifyCode() {
  return <VerifyCodeForm />;
}
