import { addToast } from "@heroui/react";

import { ColorType } from "@/types";

export default function showToast(color: ColorType, description: string) {
  return addToast({
    color: color,
    description: description,
    timeout: 3000,
    shouldShowTimeoutProgress: true,
  });
}
