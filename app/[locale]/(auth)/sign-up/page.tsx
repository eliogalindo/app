import { getTranslations } from "next-intl/server";

import SignUpForm from "@/components/auth/sign-up/sign-up-form";

export async function generateMetadata() {
  const t = await getTranslations("SignUp");

  return {
    title: t("title"),
  };
}

export default function SignUp() {
  return <SignUpForm />;
}
