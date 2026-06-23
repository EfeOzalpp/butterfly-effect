import { sampleShapeForAvg } from "../shapeForAvg";
import type { ShapeKey } from "../types";
import type { ShapeProbSpec } from "../probabilitySpec";

const SHAPES: ShapeKey[] = [
  "clouds",
  "snow",
  "house",
  "power",
  "sun",
  "villa",
  "car",
  "sea",
  "carFactory",
  "bus",
  "trees",
];

function flatSpec(weights: Partial<Record<ShapeKey, number>>): ShapeProbSpec {
  const spec = {} as ShapeProbSpec;
  for (const shape of SHAPES) {
    spec[shape] = [{ t: 0, prob: weights[shape] ?? 0 }];
  }
  return spec;
}

function countShapes(args: {
  avg: number;
  seed: string;
  count: number;
  spec?: ShapeProbSpec;
}) {
  const counts = new Map<ShapeKey, number>();
  for (let orderIndex = 0; orderIndex < args.count; orderIndex += 1) {
    const shape = sampleShapeForAvg(args.avg, args.seed, orderIndex, args.spec);
    counts.set(shape, (counts.get(shape) ?? 0) + 1);
  }
  return counts;
}

describe("sampleShapeForAvg", () => {
  test("ordered sampling consumes the full weighted sequence before reseeding", () => {
    const spec = flatSpec({ clouds: 1, house: 0.25 });
    const counts = countShapes({ avg: 0.5, seed: "shape-test", count: 100, spec });

    expect(counts.get("clouds")).toBe(80);
    expect(counts.get("house")).toBe(20);
  });

  test("default mid-score sampling keeps broad shape coverage", () => {
    const counts = countShapes({ avg: 0.55, seed: "dotgraph-bag-v1", count: 300 });
    const presentShapes = SHAPES.filter((shape) => (counts.get(shape) ?? 0) > 0);
    const maxCount = Math.max(...SHAPES.map((shape) => counts.get(shape) ?? 0));

    expect(presentShapes).toHaveLength(SHAPES.length);
    expect(maxCount).toBeLessThanOrEqual(45);
  });
});
