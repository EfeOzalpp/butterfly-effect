// src/canvas-engine/adjustable-rules/placement-rules/questionnaire.ts

import type { ScenePlacementRules } from "./helpers";

export const QUESTIONNAIRE_PLACEMENTS: ScenePlacementRules = {

  // Sky 
  sun: {
    zones: [
      { verticalK: [0.03, 0.05], horizontalK: [0.13, 0.15],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      { verticalK: [0.08, 0.12], horizontalK: [0.8, 0.82],
        count: { mobile: 0, tablet: 1, laptop: 0 } },
      
      { verticalK: [0.02, 0.04], horizontalK: [0.95, 0.98],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
    ],
  },

  clouds: {
    quota: [{ t: 0, pct: 35 }, { t: 1, pct: 55 }],
    zones: [
      // top left
      { verticalK: [0, 0.05], horizontalK: [0, 0.05],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.05, 0.1], horizontalK: [0, 0.05],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.1, 0.15], horizontalK: [0.05, 0.08],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // mid left
      { verticalK: [0.1, 0.15], horizontalK: [0.2, 0.25],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.13, 0.18], horizontalK: [0.23, 0.25],
        count: { mobile: 0, tablet: 0, laptop: 1 } },  
      { verticalK: [0.15, 0.2], horizontalK: [0.24, 0.27],
        count: { mobile: 0, tablet: 0, laptop: 1 } }, 

      // right top
      { verticalK: [0.05, 0.1], horizontalK: [0.95, 1],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.1, 0.15], horizontalK: [0.88, 0.92],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.12, 0.18], horizontalK: [0.82, 0.92],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // mid top
      { verticalK: [0.03, 0.05], horizontalK: [0.55, 0.62],
        count: { mobile: 0, tablet: 0, laptop: 1 } },   
      { verticalK: [0, 0], horizontalK: [0.58, 0.67],
        count: { mobile: 0, tablet: 0, laptop: 1 } }, 

      { verticalK: [0.03, 0.05], horizontalK: [0.3, 0.37],
        count: { mobile: 0, tablet: 0, laptop: 1 } },   
      { verticalK: [0, 0], horizontalK: [0.25, 0.3],
        count: { mobile: 0, tablet: 0, laptop: 1 } }, 

      // mid bottom    
      { verticalK: [0.12, 0.16], horizontalK: [0.68, 0.7],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.17, 0.22], horizontalK: [0.62, 0.72],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.2, 0.25], horizontalK: [0.62, 0.64],
        count: { mobile: 0, tablet: 0, laptop: 1 } }, 

      // left bottom 
      { verticalK: [0.15, 0.2], horizontalK: [0.1, 0.15],
        count: { mobile: 0, tablet: 0, laptop: 0 } },
      { verticalK: [0.2, 0.25], horizontalK: [0.08, 0.1],
        count: { mobile: 0, tablet: 0, laptop: 0 } },   
    ],
  },
  snow: {
    quota: [{ t: 0, pct: 40 }, { t: 1, pct: 60 }],
    zones: [
      // mid top
      { verticalK: [0.08, 0.1], horizontalK: [0.75, 0.75],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.04, 0.07], horizontalK: [0.8, 0.8],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // mid bottom
      { verticalK: [0.12, 0.18], horizontalK: [0.35, 0.35],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.15, 0.2], horizontalK: [0.38, 0.4],
        count: { mobile: 0, tablet: 0, laptop: 1 } }, 

      // ground
      { verticalK: [0.7, 0.75], horizontalK: [0.6, 0.65],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.85, 0.9], horizontalK: [0.8, 0.85],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.75, 0.8], horizontalK: [0.2, 0.2],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
    ],
  },

  // Building shapes
  villa: {
    quota: [{ t: 0, pct: 45 }, { t: 1, pct: 25 }],
    zones: [
      // left side close
      { verticalK: [0.9, 0.95], horizontalK: [0, 0.1],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.8, 0.85], horizontalK: [0.1, 0.2],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.85, 0.9], horizontalK: [0.05, 0.15],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.65, 0.75], horizontalK: [0.22, 0.28],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.75, 0.85], horizontalK: [0, 0.1],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.75, 0.85], horizontalK: [0.2, 0.3],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.65, 0.75], horizontalK: [0.25, 0.35],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // left side far
      { verticalK: [0.5, 0.55], horizontalK: [0.1, 0.2],
        count: { mobile: 0, tablet: 0, laptop: 3 } },  
      { verticalK: [0.55, 0.6], horizontalK: [0.05, 0.15],
        count: { mobile: 0, tablet: 0, laptop: 2 } },  
      { verticalK: [0.7, 0.75], horizontalK: [0.15, 0.2],
        count: { mobile: 0, tablet: 0, laptop: 2 } },  
      { verticalK: [0.65, 0.7], horizontalK: [0.35, 0.45],
        count: { mobile: 0, tablet: 0, laptop: 2 } }, 
      { verticalK: [0.7, 0.75], horizontalK: [0.25, 0.35],
        count: { mobile: 0, tablet: 0, laptop: 2 } },

      // right side far 
      { verticalK: [0.5, 0.55], horizontalK: [0.8, 0.9],
        count: { mobile: 0, tablet: 0, laptop: 3 } },  
      { verticalK: [0.55, 0.6], horizontalK: [0.75, 0.85],
        count: { mobile: 0, tablet: 0, laptop: 2 } }, 

      { verticalK: [0.5, 0.55], horizontalK: [0.6, 0.7],
        count: { mobile: 0, tablet: 0, laptop: 6 } },  
      { verticalK: [0.55, 0.5], horizontalK: [0.65, 0.75],
        count: { mobile: 0, tablet: 0, laptop: 4 } }, 
          
      // close mid
      { verticalK: [0.95, 0.95], horizontalK: [0.35, 0.5],
        count: { mobile: 0, tablet: 0, laptop: 1 } },  
      { verticalK: [0.9, 0.9], horizontalK: [0.5, 0.7],
        count: { mobile: 0, tablet: 0, laptop: 1 } },  
      { verticalK: [0.8, 0.9], horizontalK: [0.55, 0.55],
        count: { mobile: 0, tablet: 0, laptop: 1 } }, 
      { verticalK: [0.8, 0.9], horizontalK: [0.6, 0.75],
        count: { mobile: 0, tablet: 0, laptop: 1 } }, 

      // left side far 2  
      { verticalK: [0.5, 0.5], horizontalK: [0.25, 0.3],
        count: { mobile: 0, tablet: 0, laptop: 6 } }, 
      { verticalK: [0.55, 0.5], horizontalK: [0.25, 0.3],
        count: { mobile: 0, tablet: 0, laptop: 3 } },
        
      // mid far
      { verticalK: [0.55, 0.6], horizontalK: [0.5, 0.55],
        count: { mobile: 0, tablet: 0, laptop: 3 } },
      { verticalK: [0.6, 0.65], horizontalK: [0.5, 0.5],
        count: { mobile: 0, tablet: 0, laptop: 2 } },
      { verticalK: [0.5, 0.55], horizontalK: [0.55, 0.6],
        count: { mobile: 0, tablet: 0, laptop: 5 } },

      { verticalK: [0.55, 0.55], horizontalK: [0.3, 0.55],
        count: { mobile: 0, tablet: 0, laptop: 4 } },  

      // mid-right
      { verticalK: [0.7, 0.75], horizontalK: [0.6, 0.65],
        count: { mobile: 1, tablet: 1, laptop: 1 } }, 

      // mid-right-2
      { verticalK: [0.8, 0.85], horizontalK: [0.65, 0.75],
        count: { mobile: 1, tablet: 1, laptop: 1 } }, 
      { verticalK: [0.65, 0.7], horizontalK: [0.75, 0.85],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.65, 0.7], horizontalK: [0.65, 0.75],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.7, 0.75], horizontalK: [0.8, 0.85],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
        
      // right
      { verticalK: [0.85, 0.95], horizontalK: [0.75, 0.95],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.9, 0.95], horizontalK: [0.8, 1],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      { verticalK: [0.6, 0.7], horizontalK: [0.9, 0.95],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.6, 0.65], horizontalK: [0.9, 0.95],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.55, 0.6], horizontalK: [0.85, 0.95],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // mid right far
      { verticalK: [0.55, 0.5], horizontalK: [0.65, 0.7],
        count: { mobile: 1, tablet: 1, laptop: 2 } },
      { verticalK: [0.5, 0.55], horizontalK: [0.7, 0.75],
        count: { mobile: 1, tablet: 1, laptop: 1 } }, 
      ],
  },
  house: {
    quota: [{ t: 0, pct: 35 }, { t: 1, pct: 55 }],
    zones: [
      // left close side 
      { verticalK: [0.7, 0.7], horizontalK: [0.05, 0.2],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.6, 0.65], horizontalK: [0.25, 0.3],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.7, 0.75], horizontalK: [0.15, 0.2],
        count: { mobile: 1, tablet: 1, laptop: 3 } },

      // close mid 
      { verticalK: [0.9, 0.95], horizontalK: [0.3, 0.35],
        count: { mobile: 1, tablet: 1, laptop: 1 } },     
      { verticalK: [0.82, 0.83], horizontalK: [0.35, 0.6],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      
      // mid far
      { verticalK: [0.5, 0.55], horizontalK: [0.55, 0.55],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.55, 0.6], horizontalK: [0.55, 0.6],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.6, 0.65], horizontalK: [0.5, 0.5],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // mid-right
      { verticalK: [0.7, 0.75], horizontalK: [0.7, 0.8],
        count: { mobile: 1, tablet: 1, laptop: 2 } },     
        
      // left side far
      { verticalK: [0.55, 0.5], horizontalK: [0.05, 0.2],
        count: { mobile: 0, tablet: 0, laptop: 4 } }, 

      // left side far 2  
      { verticalK: [0.45, 0.55], horizontalK: [0.25, 0.35],
        count: { mobile: 0, tablet: 0, laptop: 6 } }, 

      // right
      { verticalK: [0.65, 0.7], horizontalK: [0.75, 0.8],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      { verticalK: [0.55, 0.6], horizontalK: [0.8, 0.95],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.5, 0.55], horizontalK: [0.85, 0.95],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.8, 0.85], horizontalK: [0.95, 1],
        count: { mobile: 1, tablet: 1, laptop: 2 } },

      // right side far 
      { verticalK: [0.5, 0.55], horizontalK: [0.6, 0.7],
        count: { mobile: 0, tablet: 0, laptop: 3 } },  
      { verticalK: [0.55, 0.5], horizontalK: [0.65, 0.75],
        count: { mobile: 0, tablet: 0, laptop: 1 } }, 
      ],
  },

  // factory 
  power: {
    quota: [{ t: 0, pct: 40 }, { t: 1, pct: 30 }],
    zones: [
      // left close side 
      { verticalK: [0.7, 0.75], horizontalK: [0.1, 0.2],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // mid close 
      { verticalK: [0.85, 0.9], horizontalK: [0.3, 0.5],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.75, 0.8], horizontalK: [0.7, 0.75],
        count: { mobile: 1, tablet: 1, laptop: 1 } },  
      { verticalK: [0.65, 0.7], horizontalK: [0.6, 0.65],
        count: { mobile: 1, tablet: 1, laptop: 1 } },   
        
      // mid far
      { verticalK: [0.6, 0.65], horizontalK: [0.5, 0.5],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.55, 0.6], horizontalK: [0.55, 0.55],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // right
      { verticalK: [0.65, 0.7], horizontalK: [0.7, 0.8],
        count: { mobile: 1, tablet: 1, laptop: 1 } },   
      { verticalK: [0.55, 0.6], horizontalK: [0.87, 0.9],
        count: { mobile: 1, tablet: 1, laptop: 1 } },  
      { verticalK: [0.65, 0.75], horizontalK: [0.85, 0.9],
        count: { mobile: 1, tablet: 1, laptop: 1 } },        
    ],
  },
  carFactory: {
    quota: [{ t: 0, pct: 35 }, { t: 1, pct: 20 }],
    zones: [
      // left close side
      { verticalK: [0.8, 0.85], horizontalK: [0.05, 0.1],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.7, 0.75], horizontalK: [0.25, 0.35],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // left far
      { verticalK: [0.55, 0.6], horizontalK: [0.05, 0.1],
        count: { mobile: 1, tablet: 1, laptop: 1 } }, 

      // mid close
      { verticalK: [0.85, 0.9], horizontalK: [0.55, 0.55],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
        
      // right close
      { verticalK: [0.85, 0.9], horizontalK: [0.9, 0.95],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
    ], 
  },

  // nature
  trees: {
    quota: [{ t: 0, pct: 20 }, { t: 1, pct: 40 }],
    zones: [
      // left close 
      { verticalK: [0.8, 0.95], horizontalK: [0.05, 0.1],
        count: { mobile: 0, tablet: 0, laptop: 3 } },
      { verticalK: [0.75, 0.8], horizontalK: [0.25, 0.35],
        count: { mobile: 0, tablet: 0, laptop: 3 } },
      { verticalK: [0.7, 0.8], horizontalK: [0.15, 0.25],
        count: { mobile: 0, tablet: 0, laptop: 3 } },
      { verticalK: [0.85, 0.9], horizontalK: [0.0, 0.15],
        count: { mobile: 0, tablet: 0, laptop: 3 } },
      { verticalK: [0.75, 0.8], horizontalK: [0.35, 0.55],
        count: { mobile: 0, tablet: 0, laptop: 2 } }, 
      { verticalK: [0.75, 0.8], horizontalK: [0, 0.15],
        count: { mobile: 0, tablet: 0, laptop: 4 } }, 
      { verticalK: [0.8, 0.85], horizontalK: [0.15, 0.25],
        count: { mobile: 0, tablet: 0, laptop: 12 } }, 
      
      // left far
      { verticalK: [0.55, 0.65], horizontalK: [0.05, 0.15],
        count: { mobile: 0, tablet: 0, laptop: 3 } },
      { verticalK: [0.65, 0.7], horizontalK: [0.02, 0.1],
        count: { mobile: 0, tablet: 0, laptop: 2 } },
      { verticalK: [0.55, 0.6], horizontalK: [0.1, 0.15],
        count: { mobile: 0, tablet: 0, laptop: 5 } },
      { verticalK: [0.65, 0.75], horizontalK: [0.05, 0.1],
        count: { mobile: 0, tablet: 0, laptop: 2 } },
      { verticalK: [0.5, 0.6], horizontalK: [0.05, 0.1],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.6, 0.65], horizontalK: [0.15, 0.25],
        count: { mobile: 0, tablet: 0, laptop: 2 } },

      { verticalK: [0.65, 0.75], horizontalK: [0.2, 0.35],
        count: { mobile: 1, tablet: 1, laptop: 3 } }, 
      { verticalK: [0.7, 0.8], horizontalK: [0.05, 0.15],
        count: { mobile: 1, tablet: 1, laptop: 4 } }, 

      { verticalK: [0.55, 0.6], horizontalK: [0.25, 0.35],
        count: { mobile: 1, tablet: 1, laptop: 3 } },
      { verticalK: [0.55, 0.6], horizontalK: [0.1, 0.15],
        count: { mobile: 1, tablet: 1, laptop: 3 } },
      { verticalK: [0.6, 0.65], horizontalK: [0.15, 0.2],
        count: { mobile: 1, tablet: 1, laptop: 3 } },
      { verticalK: [0.65, 0.75], horizontalK: [0.15, 0.25],
        count: { mobile: 1, tablet: 1, laptop: 7 } },

      // left side far 2  
      { verticalK: [0.5, 0.5], horizontalK: [0.25, 0.3],
        count: { mobile: 0, tablet: 0, laptop: 6 } }, 
      { verticalK: [0.55, 0.5], horizontalK: [0.25, 0.3],
        count: { mobile: 0, tablet: 0, laptop: 6 } }, 
      { verticalK: [0.65, 0.7], horizontalK: [0.25, 0.35],
        count: { mobile: 0, tablet: 0, laptop: 12 } }, 
      { verticalK: [0.65, 0.7], horizontalK: [0.2, 0.3],
        count: { mobile: 0, tablet: 0, laptop: 12 } },

        // mid far
      { verticalK: [0.55, 0.6], horizontalK: [0.55, 0.6],
        count: { mobile: 0, tablet: 0, laptop: 4 } },
      { verticalK: [0.65, 0.7], horizontalK: [0.5, 0.6],
        count: { mobile: 0, tablet: 0, laptop: 2 } },
      { verticalK: [0.65, 0.7], horizontalK: [0.5, 0.5],
        count: { mobile: 0, tablet: 0, laptop: 2 } },
      { verticalK: [0.55, 0.6], horizontalK: [0.55, 0.65],
        count: { mobile: 0, tablet: 0, laptop: 2 } },
      { verticalK: [0.6, 0.65], horizontalK: [0.5, 0.6],
        count: { mobile: 0, tablet: 0, laptop: 4 } },
      { verticalK: [0.55, 0.6], horizontalK: [0.5, 0.55],
        count: { mobile: 0, tablet: 0, laptop: 8 } },
        
      { verticalK: [0.65, 0.75], horizontalK: [0.5, 0.55],
        count: { mobile: 0, tablet: 0, laptop: 4 } },
      { verticalK: [0.65, 0.75], horizontalK: [0.25, 0.5],
        count: { mobile: 0, tablet: 0, laptop: 3 } },
      { verticalK: [0.6, 0.65], horizontalK: [0.25, 0.5],
        count: { mobile: 0, tablet: 0, laptop: 4 } },

      { verticalK: [0.7, 0.75], horizontalK: [0.5, 0.55],
        count: { mobile: 0, tablet: 0, laptop: 2 } },
      { verticalK: [0.7, 0.75], horizontalK: [0.52, 0.62],
        count: { mobile: 0, tablet: 0, laptop: 2 } },
      { verticalK: [0.65, 0.7], horizontalK: [0.55, 0.65],
        count: { mobile: 0, tablet: 0, laptop: 2 } },
      { verticalK: [0.65, 0.7], horizontalK: [0.6, 0.7],
        count: { mobile: 0, tablet: 0, laptop: 2 } },

      { verticalK: [0.55, 0.55], horizontalK: [0.3, 0.55],
        count: { mobile: 0, tablet: 0, laptop: 8 } },
      { verticalK: [0.55, 0.55], horizontalK: [0.25, 0.55],
        count: { mobile: 0, tablet: 0, laptop: 16 } },

      // mid close 
      { verticalK: [0.98, 1], horizontalK: [0.25, 0.35],
        count: { mobile: 0, tablet: 0, laptop: 4  } }, 
      { verticalK: [0.9, 0.95], horizontalK: [0.3, 0.5],
        count: { mobile: 0, tablet: 0, laptop: 2 } },
      { verticalK: [0.95, 1], horizontalK: [0.5, 0.65],
        count: { mobile: 0, tablet: 0, laptop: 1 } },     
      { verticalK: [0.9, 0.95], horizontalK: [0.5, 0.65],
        count: { mobile: 0, tablet: 0, laptop: 2 } },     
      { verticalK: [0.98, 1], horizontalK: [0.5, 0.55],
        count: { mobile: 0, tablet: 0, laptop: 1 } },   
      { verticalK: [0.9, 0.95], horizontalK: [0.5, 0.5],
        count: { mobile: 0, tablet: 0, laptop: 2 } },  
      { verticalK: [0.85, 0.85], horizontalK: [0.5, 0.55],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
        
      // mid-right
      { verticalK: [0.7, 0.8], horizontalK: [0.6, 0.75],
        count: { mobile: 1, tablet: 1, laptop: 3 } },
      { verticalK: [0.67, 0.72], horizontalK: [0.7, 0.8],
        count: { mobile: 1, tablet: 1, laptop: 2 } }, 
      { verticalK: [0.75, 0.8], horizontalK: [0.75, 0.88],
        count: { mobile: 1, tablet: 1, laptop: 3 } }, 
  
      // mid-right-2 
      { verticalK: [0.85, 0.85], horizontalK: [0.55, 0.7],
        count: { mobile: 1, tablet: 1, laptop: 2 } }, 
      { verticalK: [0.75, 0.85], horizontalK: [0.55, 0.75],
        count: { mobile: 1, tablet: 1, laptop: 2 } }, 
      { verticalK: [0.65, 0.75], horizontalK: [0.65, 0.75],
        count: { mobile: 1, tablet: 1, laptop: 2 } },
      { verticalK: [0.7, 0.8], horizontalK: [0.75, 0.9],
        count: { mobile: 1, tablet: 1, laptop: 2 } },

      { verticalK: [0.55, 0.7], horizontalK: [0.8, 0.9],
        count: { mobile: 1, tablet: 1, laptop: 7 } },
      { verticalK: [0.55, 0.7], horizontalK: [0.7, 0.8],
        count: { mobile: 1, tablet: 1, laptop: 4 } },

      { verticalK: [0.65, 0.75], horizontalK: [0.9, 0.95],
        count: { mobile: 1, tablet: 1, laptop: 2 } },
      { verticalK: [0.6, 0.65], horizontalK: [0.9, 0.95],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.55, 0.6], horizontalK: [0.85, 0.95],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // right close
      { verticalK: [0.95, 1], horizontalK: [0.85, 0.95],
        count: { mobile: 1, tablet: 1, laptop: 2 } },
      { verticalK: [0.9, 0.95], horizontalK: [0.9, 1],
        count: { mobile: 1, tablet: 1, laptop: 2 } },
      { verticalK: [0.85, 0.95], horizontalK: [0.9, 1],
        count: { mobile: 1, tablet: 1, laptop: 3 } },
      { verticalK: [0.8, 0.85], horizontalK: [0.95, 1],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // right side far 
      { verticalK: [0.5, 0.55], horizontalK: [0.65, 0.75],
        count: { mobile: 0, tablet: 0, laptop: 4 } },  
      { verticalK: [0.55, 0.65], horizontalK: [0.65, 0.85],
        count: { mobile: 0, tablet: 0, laptop: 3 } }, 

      { verticalK: [0.55, 0.55], horizontalK: [0.9, 1],
        count: { mobile: 0, tablet: 0, laptop: 12 } },  
      { verticalK: [0.55, 0.65], horizontalK: [0.92, 1],
        count: { mobile: 0, tablet: 0, laptop: 8 } }, 
    ],
  },
  sea: {
    quota: [{ t: 0, pct: 20 }, { t: 1, pct: 60 }],
    zones: [
      // mid
      { verticalK: [0.85, 0.9], horizontalK: [0.6, 0.65],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // left
      { verticalK: [0.7, 0.75], horizontalK: [0.5, 0.55],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
    ],
  },

  // transportation
  bus: {
    quota: [{ t: 0, pct: 10 }, { t: 1, pct: 80 }],
    zones: [
      // left far
      { verticalK: [0.6, 0.65], horizontalK: [0.05, 0.1],
        count: { mobile: 1, tablet: 0, laptop: 1 } }, 

      // right far
      { verticalK: [0.6, 0.7], horizontalK: [0.7, 0.75],
        count: { mobile: 1, tablet: 0, laptop: 1 } },

      // mid far
      { verticalK: [0.6, 0.65], horizontalK: [0.55, 0.55],
        count: { mobile: 0, tablet: 0, laptop: 2 } },

      // mid close
      { verticalK: [0.95, 1], horizontalK: [0.5, 0.65],
        count: { mobile: 1, tablet: 0, laptop: 1 } }, 
      { verticalK: [0.75, 8], horizontalK: [0.3, 0.55],
        count: { mobile: 1, tablet: 0, laptop: 1 } }, 

      // mid-right
      { verticalK: [0.8, 0.85], horizontalK: [0.75, 0.8],
        count: { mobile: 1, tablet: 1, laptop: 1 } }, 
      ],
  },
  car: {
    quota: [{ t: 0, pct: 80 }, { t: 1, pct: 20 }],
    zones: [
      // left close
      { verticalK: [0.8, 0.85], horizontalK: [0.15, 0.2],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.9, 0.95], horizontalK: [0.1, 0.1],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // mid close
      { verticalK: [0.9, 0.95], horizontalK: [0.35, 0.35],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.82, 0.85], horizontalK: [0.5, 0.5],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // mid far  
      { verticalK: [0.65, 7], horizontalK: [0.55, 0.5],
        count: { mobile: 1, tablet: 0, laptop: 1 } }, 

      // mid-right
      { verticalK: [0.75, 0.8], horizontalK: [0.6, 0.75],
        count: { mobile: 1, tablet: 1, laptop: 1 } }, 

      // right close
      { verticalK: [0.85, 0.9], horizontalK: [0.95, 1],
        count: { mobile: 1, tablet: 1, laptop: 1 } },  
      { verticalK: [0.95, 1], horizontalK: [0.8, 0.85],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
    ],
  },
};