import { getTranslations } from "next-intl/server";

import ResetPasswordForm from "@/components/auth/reset-password/reset-password-form";

export async function generateMetadata() {
  const t = await getTranslations("ResetPassword");

  return {
    title: t("title"),
  };
}

export default function ResetPassword() {
  return <ResetPasswordForm />;
}
