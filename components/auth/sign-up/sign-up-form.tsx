"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import {
  Form,
  Input,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  addToast,
  Button,
  Avatar,
} from "@heroui/react";
import { useTranslations, useLocale } from "next-intl";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

import { useRouter } from "@/i18n/navigation";
import { SignUpSchema } from "@/schemas/auth";
import { ISignUpFormData } from "@/interfaces/auth";
import { authService } from "@/services/authService";
import { Link } from "@/i18n/navigation";
import { useVerificationStorage } from "@/stores/verificationStore";
import { VerificationCodeType } from "@/enums/verificationCodeType";
import { UserStatus } from "@/enums/userStatus";
export default function SignUpForm() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("SignUp");
  const { setData } = useVerificationStorage();

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const onSubmit = async (data: ISignUpFormData) => {
    const response = await authService.signUp(data, locale);

    if (response?.status === 200) {
      addToast({
        color: "success",
        title: t("messages.signUpSuccess"),
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      setData({
        email: data.email,
        codeType: VerificationCodeType.EmailVerification,
        verified: true,
      });
      router.push("/verify-code");
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
    handleSubmit,
  } = useFormik({
    initialValues: {
      fullName: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      passwordConfirmation: "",
      status: UserStatus.Pending,
      roles: [2], // 2 is the role ID for "user"
    },
    validationSchema: SignUpSchema(t),
    onSubmit: onSubmit,
  });

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-6">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader className="flex justify-center text-center font-bold text-2xl gap-3">
          {t("title")}
        </CardHeader>
        <CardBody className="flex flex-col items-center justify-center">
          <Avatar className="w-20 h-20 text-large mb-4" src="/favicon.ico" />
          <Form className="w-full flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="flex flex-col w-full sm:flex-row justify-between gap-2">
              <div className="flex flex-col w-full sm:flex-col gap-3">
                <Input
                  isRequired
                  errorMessage={errors.fullName}
                  id="fullName"
                  isInvalid={!!errors.fullName && touched.fullName}
                  label={t("fullName")}
                  labelPlacement="outside"
                  name="fullName"
                  placeholder={t("fullNamePlaceholder")}
                  type="text"
                  value={values.fullName}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
                <Input
                  isRequired
                  errorMessage={errors.username}
                  id="username"
                  isInvalid={!!errors.username && touched.username}
                  label={t("username")}
                  labelPlacement="outside"
                  name="username"
                  placeholder={t("usernamePlaceholder")}
                  type="text"
                  value={values.username}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col w-full sm:flex-col gap-3">
                <Input
                  isRequired
                  errorMessage={errors.email}
                  id="email"
                  isInvalid={!!errors.email && touched.email}
                  label={t("email")}
                  labelPlacement="outside"
                  name="email"
                  placeholder={t("emailPlaceholder")}
                  type="email"
                  value={values.email}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
                <Input
                  isRequired
                  errorMessage={errors.phone}
                  id="phone"
                  isInvalid={!!errors.phone && touched.phone}
                  label={t("phone")}
                  labelPlacement="outside"
                  name="phone"
                  placeholder={t("phonePlaceholder")}
                  type="tel"
                  value={values.phone}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
              </div>
            </div>
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
