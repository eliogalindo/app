"use client";

import { useFormik } from "formik";
import {
  Form,
  Input,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Divider,
  addToast,
  Avatar,
} from "@heroui/react";
import { useTranslations, useLocale } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { VerifyAccountSchema } from "@/schemas/auth";
import { IVerifyAccountFormData } from "@/interfaces/auth";
import { authService } from "@/services/authService";
import { Link } from "@/i18n/navigation";
import { useVerificationStorage } from "@/stores/verificationStore";
import { VerificationCodeType } from "@/enums/verificationCodeType";

export default function VerifyAccountForm() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("VerifyAccount");
  const { setData } = useVerificationStorage();

  const onSubmit = async (data: IVerifyAccountFormData) => {
    const response = await authService.verifyAccount(data, locale);

    if (response?.ok) {
      addToast({
        color: "success",
        title: t("messages.verificationSuccess"),
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });

      setData({
        email: data.email,
        codeType: VerificationCodeType.PasswordReset,
        verified: false,
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
    handleSubmit,
    isSubmitting,
  } = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: VerifyAccountSchema(t),
    onSubmit: onSubmit,
  });

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-6">
      <Card className="mx-auto w-full max-w-xs lg:max-w-85">
        <CardHeader className="flex justify-center text-center font-bold text-2xl gap-3">
          {t("title")}
        </CardHeader>
        <CardBody className="flex flex-col items-center justify-center">
          <Avatar className="w-20 h-20 text-large mb-8" src="/favicon.ico" />
          <Form
            className="w-full justify-center items-center space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-3 w-full">
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
