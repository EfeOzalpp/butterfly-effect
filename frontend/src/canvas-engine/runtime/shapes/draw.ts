import type { PLike } from "../p/makeP";
import type { EngineFieldItem } from "../types";
import type { ShapeRegistry } from "./registry";

export function drawItemFromRegistry(registry: ShapeRegistry, p: PLike, it: EngineFieldItem, rEff: number, opts: any) {
  const fn = registry.get(it.shape);
  if (!fn) {
    if (import.meta.env.DEV) console.warn("Unknown shape:", it.shape, it);
    return;
  }
  fn(p, it, rEff, opts);
}
