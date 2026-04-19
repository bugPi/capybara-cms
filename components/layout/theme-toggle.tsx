"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const themes = [
  { value: "light", icon: Sun, label: "日间模式" },
  { value: "dark", icon: Moon, label: "夜间模式" },
  { value: "system", icon: Monitor, label: "跟随系统" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 获取当前主题信息（仅挂载后与 next-themes 同步，避免 SSR/CSR 图标与文案不一致导致 hydration 失败）
  const currentTheme = themes.find((t) => t.value === theme) || themes[2];
  const Icon = currentTheme.icon;

  const handleClick = () => {
    const currentIndex = themes.findIndex((t) => t.value === theme);
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