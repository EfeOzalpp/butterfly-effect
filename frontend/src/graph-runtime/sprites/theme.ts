// Lightweight sprite theme entry for app-shell code.
// Keep this separate from entry.ts so theme toggles do not import SpriteShape,
// React Three Fiber, or Three material code into the main app bundle.
export { invalidateSpriteTexturesForThemeChange } from "./api/theme";
