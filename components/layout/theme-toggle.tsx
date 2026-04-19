"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", icon: Sun, label: "日间模式" },
  { value: "dark", icon: Moon, label: "夜间模式" },
  { value: "system", icon: Monitor, label: "跟随系统" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // 获取当前主题信息
  const currentTheme = themes.find((t) => t.value === theme) || themes[2];
  const Icon = currentTheme.icon;

  // 点击切换到下一个主题
  const handleClick = () => {
    const currentIndex = themes.findIndex((t) => t.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "p-2 rounded transition-colors",
        "text-muted-foreground hover:text-foreground"
      )}
      aria-label={currentTheme.label}
      title={currentTheme.label}
    >
      <Icon className="size-4" />
    </button>
  );
}