"use client";

import { useState } from "react";
import { useFormik } from "formik";
import {
  Form,
  Input,
  Checkbox,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Divider,
  Avatar,
} from "@heroui/react";
import { useTranslations, useLocale } from "next-intl";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/authStore";
import { SignInSchema } from "@/schemas/auth";
import { IAuthData, ISignInFormData } from "@/interfaces/auth";
import { authService } from "@/services/authService";
import { Link } from "@/i18n/navigation";
import { useVerificationStorage } from "@/stores/verificationStore";
import { VerificationCodeType } from "@/enums/verificationCodeType";
import showToast from "@/components/ui/toast";

export default function SignInForm() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("SignIn");
  const { setAuthData } = useAuthStore();
  const { setData } = useVerificationStorage();
  const [showPassword, setShowPassword] = useState(false);
  const handleState = () => {
    setShowPassword((showState) => !showState);
  };

  const onSubmit = async (data: ISignInFormData) => {
    const response = await authService.signIn(data, locale);

    if (response?.ok) {
      showToast("success", t("messages.signInSuccess"));
      const user: IAuthData = await response.json();

      setAuthData(user); // Store the auth user data
      router.push("/admin");
    } else if (response?.status === 403) {
      const { detail } = await response?.json();

      showToast("warning", detail);
      setData({
        email: data.email,
        codeType: VerificationCodeType.EmailVerification,
        verified: true,
      });
      router.push("/verify-code");
    } else {
      const { detail } = await response?.json();

      showToast("danger", detail);
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
      password: "",
      rememberMe: false,
    },
    validationSchema: SignInSchema(t),
    onSubmit: onSubmit,
  });

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-6">
      <Card className="mx-auto w-full max-w-xs lg:max-w-85">
        <CardHeader className="flex justify-center text-center font-bold text-2xl gap-3">
          {t("title")}
        </CardHeader>
        <CardBody className="flex flex-col items-center justify-center">
          <Avatar className="w-20 h-20 text-large mb-8" src="/vercel.png" />
          <Form
            className="w-full justify-center items-center space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-3 w-full">
              <Input
                isRequired
                autoComplete="on"
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
                autoComplete="on"
                endContent={
                  <button
                    aria-label="toggle password visibility"
                    className="focus:outline-none"
                    type="button"
                    onClick={handleState}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye stroke={2} />}
                  </button>
                }
                errorMessage={errors.password}
                id="password"
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
              <Checkbox
                classNames={{ label: "text-small" }}
                id="rememberMe"
                name="rememberMe"
                validationBehavior="aria"
                value="false"
                onChange={handleChange}
              >
                {t("rememberMe")}
              </Checkbox>

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
            href="/sign-up"
            locale={locale}
          >
            {t("signUp")}
          </Link>
          <Link
            className="text-sm hover:underline"
            href="/verify-account"
            locale={locale}
          >
            {t("forgotPassword")}
          </Link>
        </CardFooter>
      </Card>
    </section>
  );
}
