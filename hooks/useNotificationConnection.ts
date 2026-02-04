"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

import { useNotificationStore } from "@/stores/notificationStore";

export const useNotificationConnection = () => {
  const { initializeConnection, disconnectConnection } = useNotificationStore();
  const locale = useLocale();

  useEffect(() => {
    // Initialize connection when the component mounts
    void initializeConnection(locale);

    // Clean up the connection when the component unmounts
    return () => {
      void disconnectConnection();
    };
  }, [initializeConnection, disconnectConnection, locale]);
};
