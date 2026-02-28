import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale } from "../i18n.js";

/** @type {import('next-intl').RoutingConfig} */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});
