"use client";

import { Spinner } from "@heroui/spinner";
import { useTranslations } from "next-intl";

export default function LoadingSpinner() {
  const t = useTranslations("Common");

  return (
    <div className="flex h-screen w-full mx-auto items-center justify-center">
      <Spinner label={t("loading")} size="lg" variant="wave" />
    </div>
  );
}
