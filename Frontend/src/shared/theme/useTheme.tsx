import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "../../lib/util";
import { useMotionLevel, type MotionLevel } from "../motion";
import type { ThemePreference, ThemeSnapshot } from "./themeModel";
import { createThemeStore } from "./themeStore";

const themeStore = createThemeStore();

export function useTheme(): ThemeSnapshot {
  return useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot,
  );
}

export function useSetThemePreference(): (preference: ThemePreference) => void {
  return themeStore.setPreference;
}

export function AppThemeProvider({
  children,
  motionLevel,
}: {
  children: ReactNode;
  motionLevel: MotionLevel;
}): JSX.Element {
  const { prefersReducedMotion } = useMotionLevel();
  useTheme();

  useEffect(() => {
    themeStore.setMotionLevel(motionLevel, prefersReducedMotion);
  }, [motionLevel, prefersReducedMotion]);

  return <>{children}</>;
}

const themeOptions = [
  { value: "system", label: "跟随系统", Icon: Monitor },
  { value: "light", label: "浅色", Icon: Sun },
  { value: "dark", label: "深色", Icon: Moon },
] as const satisfies readonly {
  value: ThemePreference;
  label: string;
  Icon: typeof Monitor;
}[];

export function ThemePreferenceControl({ className }: { className?: string }): JSX.Element {
  const { preference } = useTheme();
  const setThemePreference = useSetThemePreference();

  return (
    <div
      className={cn(
        "grid grid-cols-3 rounded-lg border border-ink-200/70 bg-paper-100 p-1",
        className,
      )}
      role="radiogroup"
      aria-label="主题"
    >
      {themeOptions.map(({ value, label, Icon }) => {
        const selected = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setThemePreference(value)}
            className={cn(
              "inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-md px-2 text-[12px] font-medium transition",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-terra-200/70",
              selected
                ? "bg-paper-50 text-ink-900 shadow-panel"
                : "text-ink-500 hover:bg-paper-50/70 hover:text-ink-850",
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
