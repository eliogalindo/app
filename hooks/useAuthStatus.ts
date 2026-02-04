"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/services/authService";
import { IAuthData } from "@/interfaces/auth";

export const useAuthStatus = () => {
  const { setAuthData, clearAuthData, authData } = useAuthStore();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const result = await authService.checkStatus();

        if (result?.ok) {
          const userData: IAuthData = await result.json();

          // Only update if data is different
          if (!Object.is(authData, userData)) {
            setAuthData(userData);
          }
        } else {
          clearAuthData();
        }
      } catch (error) {
        if (error instanceof Error) {
          clearAuthData();
          throw error;
        }
      }
    };

    void checkAuthStatus();
    // Add authData as dependency to always compare latest
  }, [setAuthData, clearAuthData]);
};
