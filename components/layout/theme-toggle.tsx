"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const t = useTranslations("theme");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const themes = [
    { value: "light" as const, icon: Sun, label: t("light") },
    { value: "dark" as const, icon: Moon, label: t("dark") },
    { value: "system" as const, icon: Monitor, label: t("system") },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = themes.find((th) => th.value === theme) ?? themes[2];
  const Icon = currentTheme.icon;

  const handleClick = () => {
    const currentIndex = themes.findIndex((th) => th.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };

  if (!mounted) {
    return (
      <span
        className="inline-flex size-8 shrink-0 items-center justify-center rounded p-0"
        aria-hidden
      >
        <Monitor className="size-4 text-muted-foreground/40" />
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            "cursor-pointer rounded p-2 transition-colors",
            "text-muted-foreground hover:text-foreground"
          )}
          aria-label={currentTheme.label}
        >
          <Icon className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {currentTheme.label}
      </TooltipContent>
    </Tooltip>
  );
}
