// src/canvas-engine/adjustable-rules/canvas-padding/questionnaire.ts

import { makeRowForbidden, CENTER_100, type CanvasPaddingSpec } from './helpers';
import type { DeviceType } from '../../shared/responsiveness';

export const QUESTIONNAIRE_PADDING: Record<DeviceType, CanvasPaddingSpec | null> = {
  mobile: {
    rows: 40,
    useTopRatio: 1,
    forbidden: makeRowForbidden([
      CENTER_100, CENTER_100, CENTER_100, CENTER_100,
      CENTER_100, CENTER_100, CENTER_100, CENTER_100,
      CENTER_100, CENTER_100, CENTER_100, CENTER_100,
      CENTER_100,
      { left: '10%', right: '10%', center: '510%' },
      { left: '10%', right: '10%', center: '510%' },
      { left: '10%', right: '10%', center: '510%' },
      { left: '10%', right: '10%', center: '610%' },
      { left: '10%', right: '10%', center: '410%' },
      { left: '10%', right: '10%', center: '410%' },
      { left: '10%', right: '10%', center: '410%' },
      { left: '10%', right: '10%', center: '410%' },
      { left: '10%', right: '10%', center: '410%' },
      { left: '10%', right: '10%', center: '410%' },
    ]),
  },

  tablet: {
    rows: 44,
    useTopRatio: 1,
    forbidden: makeRowForbidden([
      CENTER_100, CENTER_100, CENTER_100, CENTER_100,
      CENTER_100, CENTER_100, CENTER_100, CENTER_100,
      CENTER_100, CENTER_100, CENTER_100,
      { left: '10%', right: '10%', center: '510%' },
      { left: '10%', right: '10%', center: '56%' },
      { left: '10%', right: '10%', center: '56%' },
      { left: '10%', right: '10%', center: '66%' },
      { left: '10%', right: '10%', center: '66%' },
      { left: '10%', right: '10%', center: '410%' },
      { left: '10%', right: '10%', center: '410%' },
      { left: '10%', right: '10%', center: '410%' },
      { left: '10%', right: '10%', center: '410%' },
    ]),
  },

  laptop: {
    rows: 16,
    useTopRatio: 1,
    forbidden: makeRowForbidden([
      CENTER_100,
      { left: '0%', center: '40%', right: '0%' },
      { left: '0%', center: '40%', right: '0%' },
      { left: '0%', center: '40%', right: '0%' },
      { left: '10%', center: '40%', right: '10%' },
      { left: '10%', center: '40%', right: '10%' },
      { left: '10%', center: '30%', right: '10%' },
      { left: '5%',  center: '30%', right: '5%'  },
      { left: '0%',  center: '30%', right: '0%'  },
      { left: '0%',  center: '30%', right: '0%'  },
      { left: '0%',  center: '30%', right: '0%'  },
      { left: '0%',  center: '30%', right: '0%'  },
      { left: '0%',  center: '30%', right: '0%'  },
      { left: '0%',  center: '30%', right: '0%'  },
      { left: '0%',  center: '30%', right: '0%'  },
      CENTER_100, CENTER_100, CENTER_100, CENTER_100,
    ]),
  },
};
