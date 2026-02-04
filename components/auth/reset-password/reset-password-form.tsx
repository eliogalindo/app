"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useFormik } from "formik";
import {
  addToast,
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Form,
  Input,
} from "@heroui/react";
import { useLocale, useTranslations } from "next-intl";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

import { Link, useRouter } from "@/i18n/navigation";
import { ResetPasswordSchema } from "@/schemas/auth";
import { IResetPasswordFormData, IVerificationData } from "@/interfaces/auth";
import { authService } from "@/services/authService";
import { useVerificationStorage } from "@/stores/verificationStore";
import { VerificationCodeType } from "@/enums/verificationCodeType";

export default function ResetPasswordForm() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("ResetPassword");

  const { clearData } = useVerificationStorage();
  const data: IVerificationData | null = useVerificationStorage(
    (state) => state.data,
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const onSubmit = async (data: IResetPasswordFormData) => {
    const response = await authService.resetPassword(data, locale);

    if (response?.status === 200) {
      addToast({
        color: "success",
        title: t("messages.passwordResetSuccess"),
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      clearData();
      router.push("/sign-in");
    } else {
      const { detail } = await response?.json();

      addToast({
        color: "danger",
        title: detail,
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
    }
  };

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    isSubmitting,
    setFieldValue,
    handleSubmit,
  } = useFormik({
    initialValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
    validationSchema: ResetPasswordSchema(t),
    onSubmit: onSubmit,
  });

  useEffect(() => {
    if (data) {
      setFieldValue("email", data.email);
    }
  }, [data]);

  const isButtonDisabled = useCallback(() => {
    if (!data) return true;

    return (
      data.codeType !== VerificationCodeType.PasswordReset || !data.verified
    );
  }, [data]);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-6">
      <Card className="mx-auto w-full max-w-xs lg:max-w-85">
        <CardHeader className="flex justify-center text-center font-bold text-2xl gap-3">
          {t("title")}
        </CardHeader>
        <CardBody className="flex flex-col items-center justify-center">
          <Avatar className="w-20 h-20 text-large mb-4" src="/favicon.ico" />
          <Form className="w-full flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="flex flex-col w-full sm:flex-row justify-between gap-2" />
            <div className="flex flex-col w-full sm:flex-col gap-3">
              <Input
                isRequired
                endContent={
                  <button
                    aria-label="toggle password visibility"
                    className="focus:outline-none"
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <IconEyeOff stroke={2} />
                    ) : (
                      <IconEye stroke={2} />
                    )}
                  </button>
                }
                errorMessage={errors.password}
                isInvalid={!!errors.password && touched.password}
                label={t("password")}
                labelPlacement="outside"
                name="password"
                placeholder={t("passwordPlaceholder")}
                type={showPassword ? "text" : "password"}
                value={values.password}
                onBlur={handleBlur}
                onChange={handleChange}
              />
              <Input
                isRequired
                endContent={
                  <button
                    aria-label="toggle password confirmation visibility"
                    className="focus:outline-none"
                    type="button"
                    onClick={() => setShowPasswordConfirm((prev) => !prev)}
                  >
                    {showPasswordConfirm ? (
                      <IconEyeOff stroke={2} />
                    ) : (
                      <IconEye stroke={2} />
                    )}
                  </button>
                }
                errorMessage={errors.passwordConfirmation}
                isInvalid={
                  !!errors.passwordConfirmation && touched.passwordConfirmation
                }
                label={t("passwordConfirmation")}
                labelPlacement="outside"
                name="passwordConfirmation"
                placeholder={t("passConfirmPlaceholder")}
                type={showPasswordConfirm ? "text" : "password"}
                value={values.passwordConfirmation}
                onBlur={handleBlur}
                onChange={handleChange}
              />
              <div className="flex gap-4">
                <Button
                  className="w-full"
                  color="primary"
                  isDisabled={isButtonDisabled()}
                  isLoading={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? t("submitting") : t("submit")}
                </Button>
              </div>
            </div>
          </Form>
        </CardBody>
        <Divider />
        <CardFooter className="flex justify-center flex-col items-center text-center gap-2">
          <Link
            className="text-sm hover:underline"
            href="/sign-in"
            locale={locale}
          >
            {t("signIn")}
          </Link>
        </CardFooter>
      </Card>
    </section>
  );
}
