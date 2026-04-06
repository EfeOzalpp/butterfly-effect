// src/canvas-engine/adjustable-rules/canvas-padding/index.ts

import type { SceneLookupKey } from '../sceneMode';
import type { DeviceType } from '../../shared/responsiveness';

export type { CanvasPaddingSpec } from './helpers';

import { START_PADDING }         from './start';
import { QUESTIONNAIRE_PADDING }          from './questionnaire';
import { CITY_PADDING }          from './city';

export const CANVAS_PADDING: Record<SceneLookupKey, Record<DeviceType, import('./helpers').CanvasPaddingSpec | null>> = {
  start:         START_PADDING,
  city:          CITY_PADDING,
  questionnaire: QUESTIONNAIRE_PADDING,
};
