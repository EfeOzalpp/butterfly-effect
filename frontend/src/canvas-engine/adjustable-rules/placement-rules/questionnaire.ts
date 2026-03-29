// src/canvas-engine/adjustable-rules/placement-rules/questionnaire.ts
// Overrides applied on top of the base mode when questionnaire is open.
// Wide bands and moderate counts — shapes fill available space loosely.

import type { ScenePlacementRules } from "./helpers";

export const QUESTIONNAIRE_PLACEMENTS: ScenePlacementRules = {
  sun:        { zones: [{ verticalK: [0.0, 0.8 ], count: { mobile: 1, tablet: 1, laptop: 1 } }] },
  clouds:     { zones: [{ verticalK: [0.0, 0.65], count: { mobile: 2, tablet: 2, laptop: 3 } }] },
  snow:       { zones: [{ verticalK: [0.0, 0.8 ], count: { mobile: 1, tablet: 2, laptop: 3 } }] },
  bus:        { zones: [{ verticalK: [0.0, 1.0 ], count: { mobile: 1, tablet: 2, laptop: 3 } }] },
  house:      { zones: [{ verticalK: [0.0, 1.0 ], count: { mobile: 2, tablet: 3, laptop: 5 } }] },
  villa:      { zones: [{ verticalK: [0.0, 1.0 ], count: { mobile: 1, tablet: 2, laptop: 4 } }] },
  power:      { zones: [{ verticalK: [0.7, 1.0 ], count: { mobile: 1, tablet: 2, laptop: 3 } }] },
  carFactory: { zones: [{ verticalK: [0.8, 1.0 ], count: { mobile: 1, tablet: 1, laptop: 2 } }] },
  trees:      { zones: [{ verticalK: [0.0, 1.0 ], count: { mobile: 3, tablet: 5, laptop: 8 } }] },
  car:        { zones: [{ verticalK: [0.0, 1.0 ], count: { mobile: 2, tablet: 3, laptop: 4 } }] },
  sea:        { zones: [{ verticalK: [0.8, 1.0 ], count: { mobile: 1, tablet: 2, laptop: 3 } }] },
};
