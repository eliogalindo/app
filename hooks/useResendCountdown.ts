import { useEffect, useState } from "react";

import { useVerificationStorage } from "@/stores/verificationStore";

export const useResendCountdownWithStore = (duration: number) => {
  const { resendExpiresAt, startResendTimer, clearResendTimer } =
    useVerificationStorage();

  const [countdown, setCountdown] = useState<number>(0);
  const isDisabled = countdown > 0;

  useEffect(() => {
    const updateCountdown = () => {
      if (!resendExpiresAt) {
        setCountdown(0);

        return;
      }

      const now = Date.now();
      const remaining = Math.max(Math.ceil((resendExpiresAt - now) / 1000), 0);

      setCountdown(remaining);

      if (remaining <= 0) {
        clearResendTimer();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [resendExpiresAt]);

  const start = () => {
    startResendTimer(duration);
  };

  return { countdown, isDisabled, start };
};
