import { VerificationCodeType } from "@/enums/verificationCodeType";
import { UserStatus } from "@/enums/userStatus";

export interface ISignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}
export interface ISignUpFormData {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  status: UserStatus; // 2: pending
  roles: number[];
}
export interface IResetPasswordFormData {
  email: string;
  password: string;
  passwordConfirmation: string;
}
export interface IVerifyCodeFormData {
  email: string;
  codeType: VerificationCodeType;
  code: string;
}
export interface IVerifyAccountFormData {
  email: string;
}
export interface IAuthData {
  id: string;
  username: string;
  email: string;
  avatar: string;
  roles: string[];
  permissions: string[];
}

export interface IAuthState {
  // Auth data
  authData: IAuthData | null;
  isAuthenticated: boolean;

  // Actions
  setAuthData: (data: IAuthData) => void;
  clearAuthData: () => void;
}

export interface IVerificationData {
  email: string;
  codeType: VerificationCodeType;
  verified: boolean;
}
export interface IVerificationState {
  data: IVerificationData | null;
  resendExpiresAt: number | null;

  setData: (data: IVerificationData | null) => void;
  clearData: () => void;

  startResendTimer: (duration: number) => void;
  clearResendTimer: () => void;
}
