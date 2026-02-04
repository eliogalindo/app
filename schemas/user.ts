import * as yup from "yup";

import { TranslationFunction } from "@/types";

export const UserSchema = (t: TranslationFunction, id?: string) =>
  yup.object().shape({
    fullName: yup
      .string()
      .max(50, t("messages.fullNameMaxLength"))
      .required(t("messages.fieldRequired")),
    username: yup
      .string()
      .max(50, t("messages.usernameMaxLength"))
      .required(t("messages.fieldRequired")),
    phone: yup
      .string()
      .min(10, t("messages.phoneNumberMinLength"))
      .max(14, t("messages.phoneNumberMaxLength"))
      .required(t("messages.fieldRequired")),
    email: yup
      .string()
      .max(50, t("messages.emailMaxLength"))
      .email(t("messages.validEmailRequired"))
      .required(t("messages.fieldRequired")),
    status: yup.string().required(t("messages.fieldRequired")),
    password: id
      ? yup.string()
      : yup
          .string()
          .min(8, t("messages.passwordMinLength"))
          .max(100, t("messages.passwordMaxLength"))
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])[A-Za-z\d@$!%*?&.]{8,}$/,
            t("messages.passwordRegex"),
          )
          .required(t("messages.fieldRequired")),
    passwordConfirmation: id
      ? yup.string().when("password", (password: string[]) => {
          const [value] = password;

          if (value) {
            return yup
              .string()
              .min(8, t("messages.passwordMinLength"))
              .max(100, t("messages.passwordMaxLength"))
              .oneOf([yup.ref("password"), ""], t("messages.passwordMatch"))
              .required(t("messages.fieldRequired"));
          }

          return yup.string();
        })
      : yup
          .string()
          .min(8, t("messages.passwordMinLength"))
          .oneOf([yup.ref("password"), ""], t("messages.passwordMatch"))
          .required(t("messages.fieldRequired")),
    roles: yup.array().min(1, t("messages.rolesRequired")),
  });
