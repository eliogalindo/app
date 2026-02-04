import { getTranslations } from "next-intl/server";

import TracesList from "@/components/traces/traces-list";

export async function generateMetadata() {
  const t = await getTranslations("Traces");

  return {
    title: t("title"),
  };
}
export default function Traces() {
  return <TracesList />;
}
