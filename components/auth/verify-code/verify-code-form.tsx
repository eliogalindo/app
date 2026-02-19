"use client";

import { useFormik } from "formik";
import {
  Form,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Divider,
  InputOtp,
  Avatar,
} from "@heroui/react";
import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";

import { useRouter } from "@/i18n/navigation";
import { VerifyCodeSchema } from "@/schemas/auth";
import { IVerificationData, IVerifyCodeFormData } from "@/interfaces/auth";
import { authService } from "@/services/authService";
import { Link } from "@/i18n/navigation";
import { useVerificationStorage } from "@/stores/verificationStore";
import { VerificationCodeType } from "@/enums/verificationCodeType";
import { useResendCountdownWithStore } from "@/hooks/useResendCountdown";
import showToast from "@/components/ui/toast";

export default function VerifyCodeForm() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("VerifyCode");

  const { setData, clearData } = useVerificationStorage();
  const data: IVerificationData | null = useVerificationStorage(
    (state) => state.data,
  );

  const [isResending, setIsResending] = useState(false);

  const { countdown, isDisabled, start } = useResendCountdownWithStore(300);

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    setFieldValue,
  } = useFormik({
    initialValues: {
      email: "",
      codeType: VerificationCodeType.EmailVerification,
      code: "",
    },
    validationSchema: VerifyCodeSchema(t),
    onSubmit: async (data: IVerifyCodeFormData) => {
      const response = await authService.verifyCode(data, locale);

      if (response?.ok) {
        showToast("success", t("messages.verificationSuccess"));

        if (data.codeType === VerificationCodeType.EmailVerification) {
          clearData();
          router.push("/sign-in");
        } else {
          setData({
            ...data,
            verified: true,
          });
          router.push("/reset-password");
        }
      } else {
        const { detail } = await response?.json();

        showToast("danger", detail);
      }
    },
  });

  useEffect(() => {
    if (data) {
      setFieldValue("email", data.email);
      setFieldValue("codeType", data.codeType);
    }
  }, [data]);

  const handleResendCode = async () => {
    if (!values.email) return;

    const verificationData = {
      email: values.email,
      codeType: values.codeType,
    };

    setIsResending(true);

    const response = await authService.resendVerification(
      verificationData,
      locale,
    );

    if (response?.ok) {
      setIsResending(false);
      start();
      showToast("success", t("messages.codeResent"));
      await setFieldValue("code", "");
    } else {
      setIsResending(false);
      const { detail } = await response?.json();

      showToast("danger", detail);
    }
  };

  const formatCountdown = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = (seconds % 60).toString().padStart(2, "0");

    return `${min}:${sec}`;
  };

  const getResendButtonLabel = () => {
    if (isResending) return t("resending");

    if (isDisabled)
      return `${t("wait")} ${formatCountdown(countdown)} ${t("secondsToResendCode")}`;

    return t("resendCode");
  };

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-6">
      <Card className="mx-auto w-full max-w-85">
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
              <div className="flex justify-center items-center w-full">
                <InputOtp
                  isRequired
                  autoComplete="on"
                  errorMessage={errors.code}
                  id="code"
                  isInvalid={!!errors.code && touched.code}
                  label={t("code")}
                  length={6}
                  name="code"
                  placeholder={t("codePlaceholder")}
                  type="text"
                  value={values.code}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
              </div>
              <div className="flex w-full gap-3">
                <Button
                  className="w-full"
                  color="primary"
                  isDisabled={!values.email}
                  isLoading={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? t("submitting") : t("submit")}
                </Button>
              </div>
              <div className="flex w-full gap-3">
                <Button
                  className="w-full"
                  isDisabled={!values.email ? isResending : isDisabled}
                  isLoading={isResending}
                  onPress={handleResendCode}
                >
                  {getResendButtonLabel()}
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
