import { describe, expect, it } from "vitest";
import {
  createThemeSnapshot,
  normalizeThemePreference,
  readSystemTheme,
  resolveThemePreference,
} from "./themeModel";

describe("themeModel", () => {
  it("normalizes unknown stored preferences to system", () => {
    expect(normalizeThemePreference("light")).toBe("light");
    expect(normalizeThemePreference("dark")).toBe("dark");
    expect(normalizeThemePreference("system")).toBe("system");
    expect(normalizeThemePreference("sepia")).toBe("system");
    expect(normalizeThemePreference(null)).toBe("system");
  });

  it("resolves system preference from the current system theme", () => {
    expect(resolveThemePreference("light", "dark")).toBe("light");
    expect(resolveThemePreference("dark", "light")).toBe("dark");
    expect(resolveThemePreference("system", "dark")).toBe("dark");
  });

  it("reads prefers-color-scheme with a light fallback", () => {
    const matchMedia = (query: string): MediaQueryList =>
      ({ media: query, matches: query.includes("dark") }) as MediaQueryList;

    expect(readSystemTheme(matchMedia)).toBe("dark");
    expect(readSystemTheme(undefined)).toBe("light");
  });

  it("creates a complete theme snapshot", () => {
    expect(createThemeSnapshot("system", "dark")).toEqual({
      preference: "system",
      resolvedTheme: "dark",
      systemTheme: "dark",
    });
  });
});
