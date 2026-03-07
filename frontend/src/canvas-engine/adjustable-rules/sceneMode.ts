// src/canvas-engine/adjustable-rules/sceneMode.ts

export const BASE_MODES = ["start", "overlay"] as const;
export type BaseMode = (typeof BASE_MODES)[number];

export const SCENE_MODIFIERS = ["questionnaire", "sectionOpen"] as const;
export type SceneModifier = (typeof SCENE_MODIFIERS)[number];

// SceneLookupKey keys the rule tables (CANVAS_PADDING, SHAPE_BANDS, etc.).
export type SceneLookupKey = BaseMode | "questionnaire" | "sectionOpen";

export type SceneState = {
  baseMode: BaseMode;
  modifiers: ReadonlySet<SceneModifier>;
};

export type SceneSignals = {
  questionnaireOpen: boolean;
  sectionOpen?: boolean;
};

export function resolveSceneState(
  signals: SceneSignals,
  opts?: { baseMode?: BaseMode }
): SceneState {
  const baseMode: BaseMode = opts?.baseMode ?? "start";

  const modifiers = new Set<SceneModifier>();
  if (signals.questionnaireOpen) modifiers.add("questionnaire");
  if (signals.sectionOpen) modifiers.add("sectionOpen");

  return { baseMode, modifiers };
}

export function isQuestionnaire(state: SceneState): boolean {
  return state.modifiers.has("questionnaire");
}

export function isSectionOpen(state: SceneState): boolean {
  return state.modifiers.has("sectionOpen");
}
