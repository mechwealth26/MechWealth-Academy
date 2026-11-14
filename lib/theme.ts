/**
 * Canvas-side design tokens. Markup should prefer Tailwind classes
 * (`gold-*`, `stone-*`, `cream-*`); these constants exist because canvas
 * 2D contexts need raw colour strings and cannot read Tailwind classes.
 * Single source of truth: change a value here, every canvas follows.
 */

export const GOLD = "#e8c96a";
export const BULL = "#0fae7d";
export const BEAR = "#b03636";
export const IVORY = "#cfccc2";
/** Low-emphasis stroke/fill tone derived from IVORY. */
export const FAINT = "rgba(207,204,194,0.16)";

export type CanvasPalette = {
  background: string;
  backgroundStart: string;
  backgroundEnd: string;
  panel: string;
  text: string;
  muted: string;
  grid: string;
  gold: string;
  bull: string;
  bear: string;
  ivory: string;
  faint: string;
  steel: string;
  tooltip: string;
  shadow: string;
  isLight: boolean;
};

const DARK_CANVAS_PALETTE: CanvasPalette = {
  background: "#070a12",
  backgroundStart: "#090d17",
  backgroundEnd: "#080b14",
  panel: "#0c111d",
  text: "#dce5f4",
  muted: "#738098",
  grid: "#74819b",
  gold: GOLD,
  bull: "#20d6a1",
  bear: "#ff4f74",
  ivory: IVORY,
  faint: FAINT,
  steel: "#8fa3bf",
  tooltip: "rgba(12, 17, 29, 0.96)",
  shadow: "rgba(5, 7, 13, 0)",
  isLight: false,
};

const LIGHT_CANVAS_PALETTE: CanvasPalette = {
  background: "#f3f6f7",
  backgroundStart: "#ffffff",
  backgroundEnd: "#edf2f4",
  panel: "#fbfcfd",
  text: "#182235",
  muted: "#667085",
  grid: "#7a8493",
  gold: "#8a6b12",
  bull: "#087d58",
  bear: "#b42333",
  ivory: "#2f3a4d",
  faint: "rgba(23,32,51,0.14)",
  steel: "#52657c",
  tooltip: "rgba(251, 252, 253, 0.97)",
  shadow: "rgba(243, 246, 247, 0)",
  isLight: true,
};

/** Read at draw time so animated and reduced-motion canvases can repaint live. */
export function getCanvasPalette(): CanvasPalette {
  if (
    typeof document !== "undefined" &&
    document.documentElement.dataset.theme === "light"
  ) {
    return LIGHT_CANVAS_PALETTE;
  }
  return DARK_CANVAS_PALETTE;
}
