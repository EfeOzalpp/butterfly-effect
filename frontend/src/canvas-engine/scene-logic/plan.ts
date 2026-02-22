// src/canvas-engine/scene-logic/plan.ts

import type { QuotaSpecificationByKind } from "../condition/domain";
import type { ConditionKind, ShapeName, Size } from "../condition/domain";
import type { PoolItem as PlannerPoolItem } from "../condition/types";

import { countsFromSlider, adjustConditionsStable } from "../condition/conditionMix";

import { planForBucket } from "../condition/conditionPlanner";

export type PlannedPoolItem = PlannerPoolItem & {
  shape?: ShapeName;
  size?: Size;
};

export function retargetKindsStable(pool: PlannedPoolItem[], u: number, desiredSize: number) {
  // pool-size-aware counts (already sums to desiredSize)
  const targetCounts = countsFromSlider(u, desiredSize);

  const currentKinds = pool.map((p) => p.cond);
  const newKinds = adjustConditionsStable(currentKinds, targetCounts);

  for (let i = 0; i < pool.length; i++) {
    pool[i].cond = (newKinds[i] ?? pool[i].cond) as ConditionKind;
  }
}

export function assignShapesByPlanner(
  pool: PlannedPoolItem[],
  u: number,
  salt: number,
  quotaSpecification: QuotaSpecificationByKind
) {
  const byKind: Record<ConditionKind, PlannedPoolItem[]> = {
    A: [],
    B: [],
    C: [],
    D: [],
  };

  for (const it of pool) byKind[it.cond].push(it);

  (["A", "B", "C", "D"] as const).forEach((kind) => {
    const items = byKind[kind];
    if (!items.length) return;

    const map = planForBucket(kind, items, u, salt, quotaSpecification);

    for (const p of items) {
      const asn = map.get(p.id);
      if (asn) {
        p.shape = asn.shape;
        p.size = asn.size;
      }
    }
  });
}