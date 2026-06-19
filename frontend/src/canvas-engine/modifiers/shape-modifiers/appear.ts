// Shared entry animation envelope for root shape draws.
import type { ShapeMods } from "./types";

type AppearConfig = Exclude<ShapeMods["appear"], false | undefined>;
type ResolvedAppear = Required<AppearConfig>;

const ROOT_APPEAR_DEFAULT: ResolvedAppear = {
  scaleFrom: 0,
  alphaFrom: 0,
  anchor: "bottom-center",
  ease: "back",
  backOvershoot: 1.25,
};

export function resolveAppear(
  appear: ShapeMods["appear"],
  rootAppearEnabled: boolean
): ResolvedAppear | undefined {
  if (appear === false) return undefined;
  if (!rootAppearEnabled && !appear) return undefined;
  return { ...ROOT_APPEAR_DEFAULT, ...(appear ?? {}) };
}
