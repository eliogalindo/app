"use client";

import { Select, SelectItem } from "@heroui/react";
import { useLocale, Locale } from "next-intl";
import React from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { EsFlag, UsFlag } from "@/components/ui/icons";

const LocaleSwitcher = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (newLocale: Locale) => {
    router.push(pathname, { locale: newLocale });
  };

  const statusIcons: Record<string, React.ReactNode> = {
    "es-ES": <EsFlag />,
    "en-US": <UsFlag />,
  };

  return (
    <div className="w-28">
      <Select
        aria-label="Locale switcher"
        endContent={statusIcons[locale] || <UsFlag />}
        radius="full"
        selectedKeys={[locale]}
        size="sm"
        onChange={(e) => handleLocaleChange(e.target.value)}
      >
        <SelectItem key={"en-US"} endContent={<UsFlag />}>
          EN
        </SelectItem>
        <SelectItem key={"es-ES"} endContent={<EsFlag />}>
          ES
        </SelectItem>
      </Select>
    </div>
  );
};

export default LocaleSwitcher;
