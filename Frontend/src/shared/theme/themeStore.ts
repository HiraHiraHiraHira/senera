import type { MotionLevel } from "../motion";
import {
  areThemeSnapshotsEqual,
  createThemeSnapshot,
  normalizeThemePreference,
  readSystemTheme,
  themePreferenceStorageKey,
  type ThemePreference,
  type ThemeSnapshot,
} from "./themeModel";
import { applyThemeSnapshotToDocument, runThemeTransition } from "./themeDom";

type ThemeListener = () => void;
type MediaChangeListener = (event: MediaQueryListEvent) => void;
type StorageChangeListener = (event: StorageEvent) => void;

export type MatchMediaReader = () => Pick<Window, "matchMedia">["matchMedia"] | undefined;
export type StorageReader = () => Storage | undefined;
export type WindowReader = () => Pick<Window, "addEventListener" | "removeEventListener"> | undefined;

interface MediaSubscription {
  media: MediaQueryList;
  listener: MediaChangeListener;
}

export interface ThemeStore {
  getSnapshot: () => ThemeSnapshot;
  getServerSnapshot: () => ThemeSnapshot;
  subscribe: (listener: ThemeListener) => () => void;
  setPreference: (preference: ThemePreference) => void;
  setMotionLevel: (motionLevel: MotionLevel, prefersReducedMotion?: boolean) => void;
}

export function createThemeStore({
  readMatchMedia = readBrowserMatchMedia,
  readStorage = readBrowserStorage,
  readWindow = readBrowserWindow,
}: {
  readMatchMedia?: MatchMediaReader;
  readStorage?: StorageReader;
  readWindow?: WindowReader;
} = {}): ThemeStore {
  let subscribers = new Set<ThemeListener>();
  let mediaSubscription: MediaSubscription | null = null;
  let storageListener: StorageChangeListener | null = null;
  let motionLevel: MotionLevel = "full";
  let prefersReducedMotion = false;

  let currentSnapshot = createThemeSnapshot(
    readStoredThemePreference(readStorage()),
    readSystemTheme(readMatchMedia()),
  );
  const serverSnapshot = createThemeSnapshot("system", "light");

  const notify = (): void => {
    subscribers.forEach((subscriber) => subscriber());
  };

  const updateSnapshot = (
    nextSnapshot: ThemeSnapshot,
    { persist = false, animate = false }: { persist?: boolean; animate?: boolean } = {},
  ): void => {
    if (persist) writeStoredThemePreference(readStorage(), nextSnapshot.preference);
    if (areThemeSnapshotsEqual(currentSnapshot, nextSnapshot)) return;

    const apply = (): void => {
      currentSnapshot = nextSnapshot;
      applyThemeSnapshotToDocument(nextSnapshot);
      notify();
    };

    const resolvedThemeChanged = currentSnapshot.resolvedTheme !== nextSnapshot.resolvedTheme;
    if (animate && resolvedThemeChanged) {
      runThemeTransition(apply, { motionLevel, prefersReducedMotion });
      return;
    }

    apply();
  };

  const refreshSystemTheme = (): void => {
    const nextSystemTheme = readSystemTheme(readMatchMedia());
    const nextSnapshot = createThemeSnapshot(currentSnapshot.preference, nextSystemTheme);
    updateSnapshot(nextSnapshot, {
      animate: currentSnapshot.preference === "system",
    });
  };

  const refreshStoredPreference = (): void => {
    const nextPreference = readStoredThemePreference(readStorage());
    updateSnapshot(createThemeSnapshot(nextPreference, currentSnapshot.systemTheme), {
      animate: true,
    });
  };

  const startListening = (): void => {
    const matchMedia = readMatchMedia();
    if (matchMedia && !mediaSubscription) {
      const media = matchMedia("(prefers-color-scheme: dark)");
      const listener: MediaChangeListener = () => refreshSystemTheme();
      addMediaListener(media, listener);
      mediaSubscription = { media, listener };
    }

    const windowRef = readWindow();
    if (windowRef && !storageListener) {
      storageListener = (event) => {
        if (event.key === themePreferenceStorageKey) refreshStoredPreference();
      };
      windowRef.addEventListener("storage", storageListener);
    }

    updateSnapshot(
      createThemeSnapshot(readStoredThemePreference(readStorage()), readSystemTheme(readMatchMedia())),
    );
  };

  const stopListening = (): void => {
    if (mediaSubscription) {
      removeMediaListener(mediaSubscription.media, mediaSubscription.listener);
      mediaSubscription = null;
    }
    const windowRef = readWindow();
    if (windowRef && storageListener) {
      windowRef.removeEventListener("storage", storageListener);
      storageListener = null;
    }
  };

  applyThemeSnapshotToDocument(currentSnapshot);

  return {
    getSnapshot: () => currentSnapshot,
    getServerSnapshot: () => serverSnapshot,
    subscribe: (listener) => {
      subscribers.add(listener);
      if (subscribers.size === 1) startListening();
      return () => {
        subscribers.delete(listener);
        if (subscribers.size === 0) {
          stopListening();
          subscribers = new Set();
        }
      };
    },
    setPreference: (preference) => {
      updateSnapshot(createThemeSnapshot(preference, currentSnapshot.systemTheme), {
        animate: true,
        persist: true,
      });
    },
    setMotionLevel: (nextMotionLevel, nextPrefersReducedMotion = prefersReducedMotion) => {
      motionLevel = nextMotionLevel;
      prefersReducedMotion = nextPrefersReducedMotion;
    },
  };
}

function readStoredThemePreference(storage: Storage | undefined): ThemePreference {
  if (!storage) return "system";
  try {
    return normalizeThemePreference(storage.getItem(themePreferenceStorageKey));
  } catch {
    return "system";
  }
}

function writeStoredThemePreference(storage: Storage | undefined, preference: ThemePreference): void {
  if (!storage) return;
  try {
    storage.setItem(themePreferenceStorageKey, preference);
  } catch {
    // Persistence is best-effort; DOM theme state still updates.
  }
}

function readBrowserMatchMedia(): Pick<Window, "matchMedia">["matchMedia"] | undefined {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
  return window.matchMedia.bind(window);
}

function readBrowserStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}

function readBrowserWindow(): Pick<Window, "addEventListener" | "removeEventListener"> | undefined {
  return typeof window === "undefined" ? undefined : window;
}

function addMediaListener(media: MediaQueryList, listener: MediaChangeListener): void {
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", listener);
    return;
  }
  media.addListener(listener);
}

function removeMediaListener(media: MediaQueryList, listener: MediaChangeListener): void {
  if (typeof media.removeEventListener === "function") {
    media.removeEventListener("change", listener);
    return;
  }
  media.removeListener(listener);
}
