// src/canvas-engine/adjustable-rules/sceneMode.ts

export const BASE_MODES = ["start", "city"] as const;
export type BaseMode = (typeof BASE_MODES)[number];

export const SCENE_MODIFIERS = ["questionnaire"] as const;
export type SceneModifier = (typeof SCENE_MODIFIERS)[number];

// SceneLookupKey keys the rule tables (CANVAS_PADDING, SHAPE_BANDS, etc.).
export type SceneLookupKey = BaseMode | "questionnaire";

export type SceneState = {
  baseMode: BaseMode;
  modifiers: ReadonlySet<SceneModifier>;
};

export type SceneSignals = {
  questionnaireOpen: boolean;
};

export function resolveSceneState(
  signals: SceneSignals,
  opts?: { baseMode?: BaseMode }
): SceneState {
  const baseMode: BaseMode = opts?.baseMode ?? "start";

  const modifiers = new Set<SceneModifier>();
  if (signals.questionnaireOpen) modifiers.add("questionnaire");

  return { baseMode, modifiers };
}

export function isQuestionnaire(state: SceneState): boolean {
  return state.modifiers.has("questionnaire");
}

