import { getTranslations } from "next-intl/server";

import SignInForm from "@/components/auth/sign-in/sign-in-form";

export async function generateMetadata() {
  const t = await getTranslations("SignIn");

  return {
    title: t("title"),
  };
}

export default function SignIn() {
  return <SignInForm />;
}
