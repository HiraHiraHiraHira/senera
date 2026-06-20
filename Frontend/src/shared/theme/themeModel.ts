export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export interface ThemeSnapshot {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
}

export const themePreferenceStorageKey = "senera.themePreference";

export const themePreferences = ["system", "light", "dark"] as const satisfies readonly ThemePreference[];

export function normalizeThemePreference(value: unknown): ThemePreference {
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

export function resolveThemePreference(
  preference: ThemePreference,
  systemTheme: ResolvedTheme,
): ResolvedTheme {
  return preference === "system" ? systemTheme : preference;
}

export function readSystemTheme(
  matchMedia: Pick<Window, "matchMedia">["matchMedia"] | undefined,
): ResolvedTheme {
  if (!matchMedia) return "light";
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function createThemeSnapshot(
  preference: ThemePreference,
  systemTheme: ResolvedTheme,
): ThemeSnapshot {
  return {
    preference,
    resolvedTheme: resolveThemePreference(preference, systemTheme),
    systemTheme,
  };
}

export function areThemeSnapshotsEqual(left: ThemeSnapshot, right: ThemeSnapshot): boolean {
  return (
    left.preference === right.preference &&
    left.resolvedTheme === right.resolvedTheme &&
    left.systemTheme === right.systemTheme
  );
}
