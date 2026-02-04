import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import CryptoJS from "crypto-js";

import { IVerificationData, IVerificationState } from "@/interfaces/auth";
import { SECRET_KEY } from "@/constants";

export const useVerificationStorage = create<IVerificationState>()(
  persist<IVerificationState>(
    (set) => ({
      data: null,
      resendExpiresAt: null,

      setData: (data: IVerificationData | null) => set({ data }),
      clearData: () =>
        set({
          data: null,
          resendExpiresAt: null,
        }),

      startResendTimer: (duration: number) => {
        const expires = Date.now() + duration * 1000;

        set({ resendExpiresAt: expires });
      },

      clearResendTimer: () => set({ resendExpiresAt: null }),
    }),
    {
      name: "verification-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const str = localStorage.getItem(name);

          if (!str) return null;

          try {
            const decrypted = CryptoJS.AES.decrypt(str, SECRET_KEY).toString(
              CryptoJS.enc.Utf8,
            );

            return JSON.parse(decrypted);
          } catch (error) {
            localStorage.removeItem(name);
            throw new Error(String(error));
          }
        },
        setItem: (name, value) => {
          const encrypted = CryptoJS.AES.encrypt(
            JSON.stringify(value),
            SECRET_KEY,
          ).toString();

          localStorage.setItem(name, encrypted);
        },
        removeItem: (name) => localStorage.removeItem(name),
      })),
      partialize: (state) => ({
        data: state.data,
        resendExpiresAt: state.resendExpiresAt,
        setData: state.setData,
        clearData: state.clearData,
        startResendTimer: state.startResendTimer,
        clearResendTimer: state.clearResendTimer,
      }),
    },
  ),
);
