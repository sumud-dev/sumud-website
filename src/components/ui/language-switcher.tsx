"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/src/i18n/navigation";
import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { Globe, Check } from "lucide-react";
import { cn } from "@/src/lib/utils/utils";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fi", label: "Suomi", flag: "🇫🇮" },
] as const;

interface LanguageSwitcherProps {
  variant?: "default" | "compact";
}

export default function LanguageSwitcher({ variant = "default" }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale as "en" | "fi" });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === "compact" ? "sm" : "default"}
          className={cn(
            "flex items-center gap-2 transition-opacity",
            isPending && "opacity-50"
          )}
          disabled={isPending}
        >
          {variant === "compact" ? (
            <>
              <span className="text-base">{currentLanguage.flag}</span>
              <span className="text-xs font-medium uppercase">{currentLanguage.code}</span>
            </>
          ) : (
            <>
              <Globe className="h-4 w-4" />
              <span>{currentLanguage.label}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{lang.flag}</span>
              <span>{lang.label}</span>
            </div>
            {locale === lang.code && <Check className="h-4 w-4 text-green-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
