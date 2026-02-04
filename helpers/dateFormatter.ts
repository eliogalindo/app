import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

type FormatOptions = {
  format?: string; // E.g.: 'DD/MM/YYYY hh:mm:ss A'
  timeZone?: string; // E.g.: 'America/Havana'
  fallbackToLocal?: boolean; // Uses the browser timezone if isn't specified
};

/**
 * Converts a UTC date to a local using dayjs.
 * @param utcDate Date in ISO or Date format
 * @param options Timezone and format options
 * @returns Formated date to required timezone
 */
export function utcToLocal(
  utcDate: string | Date,
  options: FormatOptions = {},
): string {
  const {
    format = "DD/MM/YYYY hh:mm:ss A",
    timeZone,
    fallbackToLocal = true,
  } = options;

  const resolvedZone =
    timeZone ||
    (fallbackToLocal
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC");

  return dayjs.utc(utcDate).tz(resolvedZone).format(format);
}
