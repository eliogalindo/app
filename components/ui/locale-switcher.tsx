"use client";

import { Select, SelectItem } from "@heroui/react";
import { useLocale, Locale } from "next-intl";
import React from "react";
import { US } from "country-flag-icons/react/3x2";
import { ES } from "country-flag-icons/react/3x2";

import { usePathname, useRouter } from "@/i18n/navigation";

const LocaleSwitcher = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (newLocale: Locale) => {
    router.push(pathname, { locale: newLocale });
  };

  const statusIcons: Record<string, React.ReactNode> = {
    "es-ES": <ES height={18} title="Español" width={18} />,
    "en-US": <US height={18} title="English" width={18} />,
  };

  return (
    <div className="w-25">
      <Select
        aria-label="Locale switcher"
        endContent={
          statusIcons[locale] || <US height={18} title="English" width={18} />
        }
        id="localeSwitcher"
        radius="full"
        selectedKeys={[locale]}
        size="sm"
        onChange={(e) => handleLocaleChange(e.target.value)}
      >
        <SelectItem
          key={"en-US"}
          endContent={<US height={18} title="English" width={18} />}
        >
          EN
        </SelectItem>
        <SelectItem
          key={"es-ES"}
          endContent={<ES height={18} title="Español" width={18} />}
        >
          ES
        </SelectItem>
      </Select>
    </div>
  );
};

export default LocaleSwitcher;
