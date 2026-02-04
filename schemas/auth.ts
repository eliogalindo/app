import * as yup from "yup";

import { TranslationFunction } from "@/types";

export const SignInSchema = (t: TranslationFunction) =>
  yup.object().shape({
    email: yup
      .string()
      .email(t("messages.validEmailRequired"))
      .required(t("messages.fieldRequired")),
    password: yup
      .string()
      .min(8, t("messages.passwordMinLength"))
      .required(t("messages.fieldRequired")),
    rememberMe: yup.boolean(),
  });

export const SignUpSchema = (t: TranslationFunction) =>
  yup.object().shape({
    fullName: yup.string().required(t("messages.fieldRequired")),
    username: yup.string().required(t("messages.fieldRequired")),
    phone: yup
      .string()
      .min(11, t("messages.phoneNumberMinLength"))
      .required(t("messages.fieldRequired")),
    email: yup
      .string()
      .email(t("messages.validEmailRequired"))
      .required(t("messages.fieldRequired")),
    status: yup.string().required(t("messages.fieldRequired")),
    password: yup
      .string()
      .min(8, t("messages.passwordMinLength"))
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])[A-Za-z\d@$!%*?&.]{8,}$/,
        t("messages.passwordRegex"),
      )
      .required(t("messages.fieldRequired")),
    passwordConfirmation: yup
      .string()
      .min(8, t("messages.passwordMinLength"))
      .oneOf([yup.ref("password"), ""], t("messages.passwordMatch"))
      .required(t("messages.fieldRequired")),
    roles: yup.array().min(1, t("messages.rolesRequired")),
  });

export const VerifyCodeSchema = (t: TranslationFunction) =>
  yup.object().shape({
    email: yup.string().required(t("messages.fieldRequired")),
    codeType: yup.number(),
    code: yup
      .string()
      .min(6, t("messages.invalidCode"))
      .required(t("messages.fieldRequired")),
  });

export const VerifyAccountSchema = (t: TranslationFunction) =>
  yup.object().shape({
    email: yup
      .string()
      .email(t("messages.validEmailRequired"))
      .required(t("messages.fieldRequired")),
  });

export const ResetPasswordSchema = (t: TranslationFunction) =>
  yup.object().shape({
    password: yup
      .string()
      .min(8, t("messages.passwordMinLength"))
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])[A-Za-z\d@$!%*?&.]{8,}$/,
        t("messages.passwordRegex"),
      )
      .required(t("messages.fieldRequired")),
    passwordConfirmation: yup
      .string()
      .min(8, t("messages.passwordMinLength"))
      .oneOf([yup.ref("password"), ""], t("messages.passwordMatch"))
      .required(t("messages.fieldRequired")),
  });
