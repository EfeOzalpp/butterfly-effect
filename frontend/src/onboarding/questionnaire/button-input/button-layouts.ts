import type { PlacementZone } from "../../../canvas-engine/adjustable-rules/placement-rules";

export type QuestionButtonPlacement = Omit<PlacementZone, "count"> & {
  w: number;
  h: number;
  rowAlign?: "start" | "center" | "end";
  colAlign?: "start" | "center" | "end";
};

function slot(
  verticalK: [number, number],
  horizontalK: [number, number],
  size: Pick<QuestionButtonPlacement, "w" | "h"> = { w: 4, h: 2 }
): QuestionButtonPlacement {
  return {
    verticalK,
    horizontalK,
    ...size,
    rowAlign: "center",
    colAlign: "center",
  };
}

const DEFAULT_BUTTON_SLOTS: QuestionButtonPlacement[] = [
  slot([0.18, 0.22], [0.08, 0.14]),
  slot([0.18, 0.22], [0.74, 0.8]),
  slot([0.3, 0.34], [0.3, 0.36]),
  slot([0.3, 0.34], [0.58, 0.64]),
  slot([0.46, 0.52], [0.42, 0.48]),
  slot([0.58, 0.64], [0.1, 0.16]),
  slot([0.58, 0.64], [0.74, 0.8]),
  slot([0.72, 0.76], [0.24, 0.3]),
  slot([0.72, 0.76], [0.56, 0.62]),
  slot([0.82, 0.86], [0.42, 0.48]),
];

const QUESTION_BUTTON_SLOTS: Record<string, QuestionButtonPlacement[]> = {
  q1: [
    slot([0.81, 0.89], [0.18, 0.27]),   // A — on foot
    slot([0.34, 0.41], [0.73, 0.82]),   // B — by bike
    slot([0.58, 0.66], [0.09, 0.16]),   // C — transit
    slot([0.17, 0.24], [0.52, 0.61]),   // D — carpool
    slot([0.69, 0.77], [0.61, 0.70]),   // E — electric
    slot([0.45, 0.53], [0.34, 0.42]),   // F — drive
  ],
  q2: [
    slot([0.24, 0.28], [0.3,  0.36]),   // A — all plants
    slot([0.24, 0.28], [0.58, 0.64]),   // B — mostly veg
    slot([0.58, 0.64], [0.08, 0.14]),   // C — some meat
    slot([0.66, 0.72], [0.74, 0.8 ]),   // D — lots of dairy
    slot([0.46, 0.52], [0.44, 0.50]),   // E — meat daily
    slot([0.36, 0.42], [0.7,  0.76]),   // F — no thought
  ],
  q3: [
    slot([0.18, 0.22], [0.12, 0.18]),   // A — obsessively
    slot([0.4,  0.46], [0.72, 0.78]),   // B — mindfully
    slot([0.64, 0.68], [0.36, 0.42]),   // C — sometimes
    slot([0.76, 0.8 ], [0.7,  0.76]),   // D — rarely
    slot([0.42, 0.48], [0.1,  0.16]),   // E — never
  ],
  q4: [
    slot([0.28, 0.32], [0.08, 0.14]),   // A — thrift always
    slot([0.2,  0.24], [0.72, 0.78]),   // B — buy to last
    slot([0.56, 0.62], [0.28, 0.34]),   // C — shop local
    slot([0.7,  0.76], [0.72, 0.78]),   // D — eco brands
    slot([0.46, 0.52], [0.44, 0.50]),   // E — buy new
    slot([0.36, 0.42], [0.1,  0.16]),   // F — fast fashion
  ],
  q5: [
    slot([0.22, 0.26], [0.12, 0.18]),   // A — compost
    slot([0.22, 0.26], [0.7,  0.76]),   // B — sort carefully
    slot([0.64, 0.7 ], [0.18, 0.24]),   // C — just recycle
    slot([0.72, 0.78], [0.58, 0.64]),   // D — sometimes
    slot([0.46, 0.52], [0.42, 0.48]),   // E — toss all
  ],
};

export function getQuestionButtonPlacement(
  questionId: string,
  optionIndex: number
): QuestionButtonPlacement {
  return (
    QUESTION_BUTTON_SLOTS[questionId]?.[optionIndex] ??
    DEFAULT_BUTTON_SLOTS[optionIndex % DEFAULT_BUTTON_SLOTS.length]
  );
}
