import type { MotionLevel } from "../motion";
import type { ThemeSnapshot } from "./themeModel";

type ViewTransitionHandle = {
  finished?: Promise<void>;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => ViewTransitionHandle;
};

export interface ThemeTransitionOptions {
  motionLevel?: MotionLevel;
  prefersReducedMotion?: boolean;
  viewTransition?: boolean;
}

const fallbackTransitionClassName = "theme-transition-fallback";
const fallbackTransitionMs = 180;
const reducedFallbackTransitionMs = 80;

export function applyThemeSnapshotToDocument(
  snapshot: ThemeSnapshot,
  documentRef: Pick<Document, "documentElement"> | undefined = readBrowserDocument(),
): void {
  const root = documentRef?.documentElement;
  if (!root) return;

  root.dataset.theme = snapshot.resolvedTheme;
  root.dataset.themePreference = snapshot.preference;
  root.style.colorScheme = snapshot.resolvedTheme;
}

export function runThemeTransition(
  apply: () => void,
  options: ThemeTransitionOptions = {},
  documentRef: Document | undefined = readBrowserDocument(),
): void {
  const root = documentRef?.documentElement;
  if (!documentRef || !root) {
    apply();
    return;
  }

  const reduced = options.prefersReducedMotion || options.motionLevel === "reduced";
  const disabled = options.motionLevel === "none";
  if (disabled) {
    apply();
    return;
  }

  const shouldUseViewTransition = options.viewTransition !== false && !reduced;
  const transitionDocument = documentRef as DocumentWithViewTransition;
  if (shouldUseViewTransition && typeof transitionDocument.startViewTransition === "function") {
    transitionDocument.startViewTransition(apply);
    return;
  }

  const duration = reduced ? reducedFallbackTransitionMs : fallbackTransitionMs;
  root.style.setProperty("--theme-transition-duration", `${duration}ms`);
  root.classList.add(fallbackTransitionClassName);
  apply();
  window.setTimeout(() => {
    root.classList.remove(fallbackTransitionClassName);
    root.style.removeProperty("--theme-transition-duration");
  }, duration + 40);
}

function readBrowserDocument(): Document | undefined {
  return typeof document === "undefined" ? undefined : document;
}
