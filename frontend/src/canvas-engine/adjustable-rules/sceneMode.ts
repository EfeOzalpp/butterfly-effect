// src/canvas-engine/adjustable-rules/sceneMode.ts

export const BASE_MODES = ["start", "overlay"] as const;
export type BaseMode = (typeof BASE_MODES)[number];

export const SCENE_MODIFIERS = ["questionnaire"] as const;
export type SceneModifier = (typeof SCENE_MODIFIERS)[number];

export type SceneLookupKey = BaseMode | SceneModifier;

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
