import {
  IResetPasswordFormData,
  ISignInFormData,
  ISignUpFormData,
  IVerifyAccountFormData,
  IVerifyCodeFormData,
} from "@/interfaces/auth";
import { API_URL } from "@/constants";
import { VerificationCodeType } from "@/enums/verificationCodeType";

class AuthService {
  public async signIn(
    data: ISignInFormData,
    locale: string = "en-US",
  ): Promise<Response | undefined> {
    try {
      return await fetch(`${API_URL}/api/v1/auth/sign-in`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Language": `${locale}`,
          "X-User-Locale": `${locale}`,
        },
        credentials: "include",
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }

  public async signUp(
    data: ISignUpFormData,
    locale: string = "en-US",
  ): Promise<Response | undefined> {
    try {
      return await fetch(`${API_URL}/api/v1/auth/sign-up`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Language": `${locale}`,
          "X-User-Locale": `${locale}`,
        },
        credentials: "include",
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }

  public async checkStatus(
    locale: string = "en-US",
  ): Promise<Response | undefined> {
    try {
      return await fetch(`${API_URL}/api/v1/auth/status`, {
        headers: {
          Accept: "application/json",
          "Accept-Language": `${locale}`,
          "X-User-Locale": `${locale}`,
        },
        credentials: "include",
        method: "GET",
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }

  public async activateAccount(
    data: {
      phoneNumber?: string;
      code: string;
    },
    locale: string = "en-US",
  ): Promise<Response | undefined> {
    try {
      return await fetch(`${API_URL}/api/auth/activate-account`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Language": `${locale}`,
          "X-User-Locale": `${locale}`,
        },
        credentials: "include",
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }

  public async resendVerification(
    data: { email: string; codeType: VerificationCodeType },
    locale: string = "en-US",
  ): Promise<Response | undefined> {
    try {
      return await fetch(`${API_URL}/api/v1/auth/resend-verification`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Language": `${locale}`,
          "X-User-Locale": `${locale}`,
        },
        credentials: "include",
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }
  public async verifyCode(
    data: IVerifyCodeFormData,
    locale: string = "en-US",
  ): Promise<Response | undefined> {
    try {
      return await fetch(`${API_URL}/api/v1/auth/verify-code`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Language": `${locale}`,
          "X-User-Locale": `${locale}`,
        },
        credentials: "include",
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }

  public async verifyAccount(
    data: IVerifyAccountFormData,
    locale: string = "en-US",
  ): Promise<Response | undefined> {
    try {
      return await fetch(`${API_URL}/api/v1/auth/verify-account`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Language": `${locale}`,
          "X-User-Locale": `${locale}`,
        },
        credentials: "include",
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }

  public async resetPassword(
    data: IResetPasswordFormData,
    locale: string = "en-US",
  ): Promise<Response | undefined> {
    try {
      return await fetch(`${API_URL}/api/v1/auth/reset-password`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Language": `${locale}`,
          "X-User-Locale": `${locale}`,
        },
        credentials: "include",
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }

  public async signOut(): Promise<Response | undefined> {
    try {
      return await fetch(`${API_URL}/api/v1/auth/sign-out`, {
        credentials: "include",
        method: "POST",
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }
}
export const authService = new AuthService();
