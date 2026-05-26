// Shared entry animation envelope for root shape draws.
import type { ShapeMods, AppearMod } from "./types";

export const ROOT_APPEAR_DEFAULT: Required<AppearMod> = {
  scaleFrom: 0,
  alphaFrom: 0,
  anchor: "bottom-center",
  ease: "back",
  backOvershoot: 1.25,
};

export function resolveAppear(
  appear: ShapeMods["appear"],
  rootAppearEnabled: boolean
): Required<AppearMod> | undefined {
  if (appear === false) return undefined;
  if (!rootAppearEnabled && !appear) return undefined;
  return { ...ROOT_APPEAR_DEFAULT, ...(appear ?? {}) };
}
