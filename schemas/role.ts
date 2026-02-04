import * as yup from "yup";

import { TranslationFunction } from "@/types";

export const RoleSchema = (t: TranslationFunction) =>
  yup.object().shape({
    denomination: yup
      .string()
      .max(100, t("messages.denominationMaxLength"))
      .required(t("messages.fieldRequired")),
    description: yup
      .string()
      .max(150, t("messages.descriptionMaxLength"))
      .required(t("messages.fieldRequired")),
    enabled: yup.boolean(),
    permissions: yup
      .array()
      .of(yup.string())
      .min(1)
      .required(t("messages.fieldRequired")),
  });
