// src/canvas-engine/validation/validateSceneProfile.ts

import type { SceneProfile } from "../scene-rules/profile";
import type { SceneLookupKey } from "../scene-state";
import { invariant } from "./invariant";

const warnedVariantBackgrounds = new Set<string>();

function warnOnce(key: string, message: string) {
  if (warnedVariantBackgrounds.has(key)) return;
  warnedVariantBackgrounds.add(key);
  console.warn(`Canvas Engine Validation Warning:\n${message}`);
}

export function validateSceneProfile(id: string, mode: SceneLookupKey, profile: SceneProfile) {
  invariant(!!profile, `[${id}] SceneProfile is missing`);
  invariant(!!profile.padding, `[${id}] missing "padding" on SceneProfile`);
  invariant(!!profile.placements, `[${id}] missing "placements" on SceneProfile`);
  invariant(!!profile.background, `[${id}] missing "background" on SceneProfile`);
  invariant(!!profile.renderCache, `[${id}] missing "renderCache" on SceneProfile`);
  invariant(typeof mode === "string", `[${id}] invalid mode`);

  if (profile.background.variants?.length && id !== "spotlight") {
    warnOnce(
      `${id}:${mode}:background-variants`,
      `[${id}] background variants are driven by the Spotlight signal. Move this background sequence to the spotlight ruleset or wire an explicit signal contract before using it here.`
    );
  }

  if (profile.placements.variants?.length && id !== "spotlight") {
    warnOnce(
      `${id}:${mode}:placement-variants`,
      `[${id}] placement variants are driven by the Spotlight signal. Move this placement sequence to the spotlight ruleset or wire an explicit signal contract before using it here.`
    );
  }

  if (profile.padding.variants?.length && id !== "spotlight") {
    warnOnce(
      `${id}:${mode}:padding-variants`,
      `[${id}] padding variants are driven by the Spotlight signal. Move this padding sequence to the spotlight ruleset or wire an explicit signal contract before using it here.`
    );
  }
}
