// Shape modifier config contracts.
// These are declarative knobs that shapes pass into applyShapeMods before drawing.
import type { Anchor } from "../../shared/geometry";

export type { Anchor };

export interface Scale2D {
  x?: number;
  y?: number;
  anchor?: Anchor;
}

export interface Scale2DOsc {
  mode?: "relative" | "absolute";
  biasX?: number;
  ampX?: number;
  biasY?: number;
  ampY?: number;
  biasAbsX?: number;
  ampAbsX?: number;
  biasAbsY?: number;
  ampAbsY?: number;
  speed?: number;
  phaseX?: number;
  phaseY?: number;
  anchor?: Anchor;
}

export interface AppearMod {
  scaleFrom?: number;
  alphaFrom?: number;
  anchor?: Anchor;
  ease?: "linear" | "cubic" | "back";
  backOvershoot?: number;
}

export interface TranslateClampX {
  min?: number;
  max?: number;
}
export interface TranslateClampY {
  min?: number;
  max?: number;
}

export interface TranslateOscX {
  amp?: number;
  speed?: number;
  phase?: number;
}
export interface TranslateOscY {
  amp?: number;
  speed?: number;
  phase?: number;
}

export interface ShapeMods {
  // Entry animation envelope. When rootAppearK is present, applyShapeMods uses
  // the standard root appear unless a shape provides overrides or disables it.
  appear?: AppearMod | false;

  // Size and motion modifiers. Shapes decide which configs they support.
  scale?: Scale;
  scale2D?: Scale2D;
  sizeOsc?: SizeOsc;
  scale2DOsc?: Scale2DOsc;
  opacityOsc?: OpacityOsc;
  rotation?: Rotation;
  rotationOsc?: RotationOsc;
  saturationOsc?: SaturationOsc;

  translateClampX?: TranslateClampX;
  translateClampY?: TranslateClampY;
  translateOscX?: TranslateOscX;
  translateOscY?: TranslateOscY;
}

export interface Scale {
  value?: number;
  anchor?: Anchor;
}

export interface SizeOsc {
  speed?: number;
  phase?: number;
  anchor?: Anchor;
  mode?: "relative" | "absolute" | "none";

  bias?: number;
  amp?: number;

  biasAbs?: number;
  ampAbs?: number;
}

export interface OpacityOsc {
  amp?: number;
  speed?: number;
  phase?: number;
}

export interface Rotation {
  speed?: number;
  phase?: number;
}

export interface RotationOsc {
  amp?: number;
  speed?: number;
  phase?: number;
}

export interface SaturationOsc {
  amp?: number;
  speed?: number;
  phase?: number;
}

export interface ShapeModifierClock {
  millis(): number;
}

export interface ApplyShapeModsOpts {
  p: ShapeModifierClock;
  x: number;
  y: number;
  r: number;
  opts?: {
    alpha?: number;
    timeMs?: number;
    liveAvg?: number;
    rootAppearK?: number;
  };
  mods?: ShapeMods;
}
