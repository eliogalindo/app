import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import CryptoJS from "crypto-js";

import { IAuthData, IAuthState } from "@/interfaces/auth";
import { SECRET_KEY } from "@/constants";

export const useAuthStore = create<IAuthState>()(
  persist<IAuthState>(
    (set) => ({
      // Initial state
      authData: null,
      isAuthenticated: false,

      // Actions to update the state
      setAuthData: (data: IAuthData) =>
        set({
          authData: data,
          isAuthenticated: true,
        }),

      clearAuthData: () =>
        set({
          authData: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage", // name of the item in the storage
      storage: createJSONStorage(() => {
        return {
          // Custom storage with encryption/decryption
          getItem: (name) => {
            const str = localStorage.getItem(name);

            if (!str) return null;

            try {
              // Decrypt the data when retrieving
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
            // Encrypt the data before storing
            const encrypted = CryptoJS.AES.encrypt(
              JSON.stringify(value),
              SECRET_KEY,
            ).toString();

            localStorage.setItem(name, encrypted);
          },
          removeItem: (name) => localStorage.removeItem(name),
        };
      }),
      // Only persist specific parts of the state if needed
      partialize: (state) => ({
        authData: state.authData,
        isAuthenticated: state.isAuthenticated,
        setAuthData: state.setAuthData,
        clearAuthData: state.clearAuthData,
      }),
    },
  ),
);
