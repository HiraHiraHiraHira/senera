import { describe, expect, it, vi } from "vitest";
import { applyThemeSnapshotToDocument, runThemeTransition } from "./themeDom";

function createDocumentMock() {
  const dataset: Record<string, string> = {};
  const classes = new Set<string>();
  const styleValues = new Map<string, string>();
  const root = {
    dataset,
    classList: {
      add: vi.fn((className: string) => classes.add(className)),
      remove: vi.fn((className: string) => classes.delete(className)),
      contains: (className: string) => classes.has(className),
    },
    style: {
      colorScheme: "",
      setProperty: vi.fn((key: string, value: string) => {
        styleValues.set(key, value);
      }),
      removeProperty: vi.fn((key: string) => {
        styleValues.delete(key);
      }),
    },
  };
  return {
    documentRef: { documentElement: root } as unknown as Document,
    root,
    styleValues,
  };
}

describe("themeDom", () => {
  it("applies resolved theme and preference to the document root", () => {
    const { documentRef, root } = createDocumentMock();

    applyThemeSnapshotToDocument(
      { preference: "system", resolvedTheme: "dark", systemTheme: "dark" },
      documentRef,
    );

    expect(root.dataset.theme).toBe("dark");
    expect(root.dataset.themePreference).toBe("system");
    expect(root.style.colorScheme).toBe("dark");
  });

  it("uses View Transition when available and motion is full", () => {
    const { documentRef } = createDocumentMock();
    const startViewTransition = vi.fn((apply: () => void) => {
      apply();
      return {};
    });
    (documentRef as unknown as { startViewTransition: typeof startViewTransition }).startViewTransition =
      startViewTransition;
    const apply = vi.fn();

    runThemeTransition(apply, { motionLevel: "full" }, documentRef);

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledTimes(1);
  });

  it("skips animation entirely when motion is disabled", () => {
    const { documentRef, root } = createDocumentMock();
    const startViewTransition = vi.fn();
    (documentRef as unknown as { startViewTransition: typeof startViewTransition }).startViewTransition =
      startViewTransition;
    const apply = vi.fn();

    runThemeTransition(apply, { motionLevel: "none" }, documentRef);

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(root.classList.add).not.toHaveBeenCalled();
    expect(apply).toHaveBeenCalledTimes(1);
  });
});
