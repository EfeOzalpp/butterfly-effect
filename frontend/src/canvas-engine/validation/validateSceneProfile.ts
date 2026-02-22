// src/canvas-engine/validation/validateSceneProfile.ts

import type { SceneProfile } from "../multi-canvas-setup/sceneProfile";
import type { SceneLookupKey } from "../adjustable-rules/sceneMode";
import { invariant } from "./invariant";

const KINDS = ["A", "B", "C", "D"] as const;

function validateQuotaSpecificationByKind(id: string, curves: any) {
  invariant(
    !!curves && typeof curves === "object",
    `[${id}] quotaSpecification must be an object keyed by condition kinds (A,B,C,D)`
  );

  for (const k of KINDS) {
    const arr = curves[k];

    invariant(
      Array.isArray(arr),
      `[${id}] quotaSpecification missing kind "${k}". Available: ${Object.keys(curves).join(", ")}`
    );

    for (const a of arr) {
      invariant(
        a && typeof a.t === "number" && a.limits && typeof a.limits === "object",
        `[${id}] quotaSpecification["${k}"] contains invalid anchor (expected { t:number, limits:object })`
      );
    }
  }
}

export function validateSceneProfile(id: string, mode: SceneLookupKey, profile: SceneProfile) {
  invariant(!!profile, `[${id}] SceneProfile is missing`);

  // padding table exists
  invariant(!!profile.padding, `[${id}] missing "padding" on SceneProfile`);

  // bands
  invariant(!!profile.bands, `[${id}] missing "bands" on SceneProfile`);

  // separation meta (by shape)
  invariant(!!profile.separationMeta, `[${id}] missing "separationMeta" on SceneProfile`);

  // poolSizes must be device-resolved numbers
  invariant(!!profile.poolSizes, `[${id}] missing "poolSizes" on SceneProfile`);
  invariant(
    typeof (profile as any).poolSizes.mobile === "number" &&
      typeof (profile as any).poolSizes.tablet === "number" &&
      typeof (profile as any).poolSizes.laptop === "number",
    `[${id}] poolSizes must define numeric values for mobile/tablet/laptop`
  );

  // quotaSpecification (resolved in profile; should be CurvesByKind directly)
  invariant(!!profile.quotaSpecification, `[${id}] missing "quotaSpecification" on SceneProfile`);
  validateQuotaSpecificationByKind(id, profile.quotaSpecification);

  // background
  invariant(!!(profile as any).background, `[${id}] missing "background" on SceneProfile`);

  // Optional sanity: if questionnaire mode, you may allow quotaSpecification to be reused/fallback.
  // The profile should already be resolved, so we just keep `mode` for better error messages.
  invariant(typeof mode === "string", `[${id}] invalid mode`);
}