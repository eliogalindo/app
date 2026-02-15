"use client";

import { Select, SelectItem } from "@heroui/react";
import { useLocale, Locale } from "next-intl";
import React from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { US } from "country-flag-icons/react/3x2";
import { ES } from "country-flag-icons/react/3x2";

const LocaleSwitcher = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (newLocale: Locale) => {
    router.push(pathname, { locale: newLocale });
  };

  const statusIcons: Record<string, React.ReactNode> = {
    "es-ES": <ES title="Español" width={18} height={18} />,
    "en-US": <US title="English" width={18} height={18} />,
  };

  return (
    <div className="w-25">
      <Select
        aria-label="Locale switcher"
        endContent={
          statusIcons[locale] || <US title="English" width={18} height={18} />
        }
        radius="full"
        selectedKeys={[locale]}
        size="sm"
        onChange={(e) => handleLocaleChange(e.target.value)}
      >
        <SelectItem
          key={"en-US"}
          endContent={<US title="English" width={18} height={18} />}
        >
          EN
        </SelectItem>
        <SelectItem
          key={"es-ES"}
          endContent={<ES title="Español" width={18} height={18} />}
        >
          ES
        </SelectItem>
      </Select>
    </div>
  );
};

export default LocaleSwitcher;
