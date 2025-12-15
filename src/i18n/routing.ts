import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar", "fi"],
  defaultLocale: "fi",
  localePrefix: "always",
});