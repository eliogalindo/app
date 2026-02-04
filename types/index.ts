import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type TranslationFunction = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

export type ColorType =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | undefined;
