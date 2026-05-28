// src/canvas-engine/multi-canvas-setup/hostDefs.ts

import { SCENE_RULESETS } from "../scene-rules/registry";
import type { SceneRuleSet } from "../scene-rules/profile";
import type { SceneLookupKey } from "../scene-state";
import type { DprMode } from "../runtime/platform/viewport";

// give the canvas the size you want
export type CanvasBounds =
  | { kind: "viewport" }
  | { kind: "parent" }
  | { kind: "fixed"; w: number; h: number };

// Base shape
interface HostDefBase {
  mount: string;
  zIndex: number;
  dprMode: DprMode;
  fpsCap?: number;
  canvasDimensions?: CanvasBounds;
  stopOnOpen?: readonly string[];
  scene?: {
    lookupKey: SceneLookupKey;
    ruleset: SceneRuleSet;
  };
}

const defineHosts = <T extends Record<string, HostDefBase>>(t: T) => t;

export const HOST_DEFS = defineHosts({
  start: {
    mount: "#canvas-root",
    zIndex: 2,
    dprMode: "cap2",
    fpsCap: 30,
    canvasDimensions: { kind: "parent" },
    scene: { lookupKey: "start", ruleset: SCENE_RULESETS.intro },
  },

  questionnaire: {
    mount: "#questionnaire-canvas-root",
    zIndex: 2,
    dprMode: "cap2",
    fpsCap: 30,
    stopOnOpen: ["start"],
    canvasDimensions: { kind: "parent" },
    scene: { lookupKey: "questionnaire", ruleset: SCENE_RULESETS.intro },
  },

  city: {
    mount: "#city-canvas-root",
    zIndex: 60,
    dprMode: "cap1_5",
    fpsCap: 60,
    stopOnOpen: ["start", "questionnaire"],
    canvasDimensions: { kind: "viewport" },
    scene: { lookupKey: "city", ruleset: SCENE_RULESETS.city },
  },
} as const);

// Now it's safe to derive HostId
export type HostId = keyof typeof HOST_DEFS;

// Public type: tighten stopOnOpen for consumers
export type HostDef = Omit<HostDefBase, "stopOnOpen"> & {
  stopOnOpen?: readonly HostId[];
};
