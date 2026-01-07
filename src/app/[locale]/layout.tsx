import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/src/i18n/routing";
import { Toaster } from "@/src/components/ui/sonner";
import { ReactQueryProvider } from "@/src/components/providers/react-query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sumud - Finnish Palestine Network",
  description:
    "Supporting Palestinian rights through education, advocacy, and community building",
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate the locale
  if (!hasLocale(routing.locales, locale)) {
    return notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Provide messages to the client side
  const messages = await getMessages();

  return (
    <ClerkProvider>
      <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} data-scroll-behavior="smooth">
        <body suppressHydrationWarning>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ReactQueryProvider>
              {children}
              <Toaster />
            </ReactQueryProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
