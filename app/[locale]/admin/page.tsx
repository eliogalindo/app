import { getTranslations } from "next-intl/server";

import { title } from "@/components/primitives";

export async function generateMetadata() {
  const t = await getTranslations("Dashboard");

  return {
    title: t("title"),
  };
}
export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h1 className={title()}>Dashboard</h1>
    </div>
  );
}
