import { describe, expect, it, vi } from "vitest";
import { themePreferenceStorageKey, type ThemePreference } from "./themeModel";
import { createThemeStore } from "./themeStore";

type Listener = (event: MediaQueryListEvent) => void;

interface FakeMediaQueryList extends MediaQueryList {
  emit: () => void;
  listenerCount: () => number;
  setMatches: (matches: boolean) => void;
}

function createMatchMediaMock(initialDark = false) {
  let media: FakeMediaQueryList | null = null;
  const matchMedia = vi.fn((query: string): MediaQueryList => {
    if (media) return media;
    const listeners = new Set<Listener>();
    let matches = initialDark;
    media = {
      media: query,
      get matches() {
        return matches;
      },
      onchange: null,
      addEventListener: vi.fn((_type: string, listener: EventListenerOrEventListenerObject) => {
        listeners.add(listener as Listener);
      }),
      removeEventListener: vi.fn((_type: string, listener: EventListenerOrEventListenerObject) => {
        listeners.delete(listener as Listener);
      }),
      addListener: vi.fn((listener: Listener) => {
        listeners.add(listener);
      }),
      removeListener: vi.fn((listener: Listener) => {
        listeners.delete(listener);
      }),
      dispatchEvent: vi.fn(() => true),
      emit: () => {
        listeners.forEach((listener) => listener({ matches, media: query } as MediaQueryListEvent));
      },
      listenerCount: () => listeners.size,
      setMatches: (nextMatches: boolean) => {
        matches = nextMatches;
      },
    } as FakeMediaQueryList;
    return media;
  });

  return { getMedia: () => media, matchMedia };
}

function createStorageMock(initial?: ThemePreference): Storage {
  const values = new Map<string, string>();
  if (initial) values.set(themePreferenceStorageKey, initial);

  return {
    get length() {
      return values.size;
    },
    clear: vi.fn(() => values.clear()),
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    key: vi.fn((index: number) => Array.from(values.keys())[index] ?? null),
    removeItem: vi.fn((key: string) => {
      values.delete(key);
    }),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value);
    }),
  };
}

function createWindowMock() {
  const listeners = new Set<(event: StorageEvent) => void>();
  return {
    windowRef: {
      addEventListener: vi.fn((_type: string, listener: EventListener) => {
        listeners.add(listener as (event: StorageEvent) => void);
      }),
      removeEventListener: vi.fn((_type: string, listener: EventListener) => {
        listeners.delete(listener as (event: StorageEvent) => void);
      }),
    },
    emitStorage: (key: string) => {
      listeners.forEach((listener) => listener({ key } as StorageEvent));
    },
    listenerCount: () => listeners.size,
  };
}

describe("createThemeStore", () => {
  it("persists explicit preferences and resolves them immediately", () => {
    const storage = createStorageMock();
    const { matchMedia } = createMatchMediaMock(false);
    const store = createThemeStore({
      readMatchMedia: () => matchMedia,
      readStorage: () => storage,
      readWindow: () => undefined,
    });
    const subscriber = vi.fn();

    const unsubscribe = store.subscribe(subscriber);
    store.setPreference("dark");

    expect(storage.setItem).toHaveBeenCalledWith(themePreferenceStorageKey, "dark");
    expect(store.getSnapshot()).toMatchObject({ preference: "dark", resolvedTheme: "dark" });
    expect(subscriber).toHaveBeenCalled();

    unsubscribe();
  });

  it("updates a system preference when prefers-color-scheme changes", () => {
    const storage = createStorageMock("system");
    const { getMedia, matchMedia } = createMatchMediaMock(false);
    const store = createThemeStore({
      readMatchMedia: () => matchMedia,
      readStorage: () => storage,
      readWindow: () => undefined,
    });
    const subscriber = vi.fn();

    const unsubscribe = store.subscribe(subscriber);
    getMedia()?.setMatches(true);
    getMedia()?.emit();

    expect(store.getSnapshot()).toMatchObject({
      preference: "system",
      resolvedTheme: "dark",
      systemTheme: "dark",
    });
    expect(subscriber).toHaveBeenCalledTimes(1);

    unsubscribe();
    expect(getMedia()?.listenerCount()).toBe(0);
  });

  it("keeps explicit preferences stable when the system theme changes", () => {
    const storage = createStorageMock("light");
    const { getMedia, matchMedia } = createMatchMediaMock(false);
    const store = createThemeStore({
      readMatchMedia: () => matchMedia,
      readStorage: () => storage,
      readWindow: () => undefined,
    });

    const unsubscribe = store.subscribe(vi.fn());
    getMedia()?.setMatches(true);
    getMedia()?.emit();

    expect(store.getSnapshot()).toMatchObject({
      preference: "light",
      resolvedTheme: "light",
      systemTheme: "dark",
    });

    unsubscribe();
  });

  it("responds to theme preference storage changes from another tab", () => {
    const storage = createStorageMock("system");
    const windowMock = createWindowMock();
    const { matchMedia } = createMatchMediaMock(false);
    const store = createThemeStore({
      readMatchMedia: () => matchMedia,
      readStorage: () => storage,
      readWindow: () => windowMock.windowRef,
    });
    const subscriber = vi.fn();

    const unsubscribe = store.subscribe(subscriber);
    storage.setItem(themePreferenceStorageKey, "dark");
    windowMock.emitStorage(themePreferenceStorageKey);

    expect(store.getSnapshot()).toMatchObject({ preference: "dark", resolvedTheme: "dark" });
    expect(subscriber).toHaveBeenCalledTimes(1);

    unsubscribe();
    expect(windowMock.listenerCount()).toBe(0);
  });
});
