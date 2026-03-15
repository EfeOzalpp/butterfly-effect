import { useMemo } from "react";

import { useAbsoluteScore } from "../lib/hooks/useAbsoluteScore";
import { useRelativeScores } from "../lib/hooks/useRelativeScore";

export type GraphDatum = {
  _id?: string;
  avgWeight?: number;
  weights?: Record<string, number>;
};

const EMPTY_DATA: GraphDatum[] = [];

export default function useGraphData(data: unknown) {
  const safeData = useMemo<GraphDatum[]>(
    () => (Array.isArray(data) ? (data as GraphDatum[]) : EMPTY_DATA),
    [data]
  );

  const dataById = useMemo(() => {
    const map = new Map<string, GraphDatum>();
    for (const item of safeData) {
      if (item?._id) map.set(item._id, item);
    }
    return map;
  }, [safeData]);

  const { getForId: getRelForId, getForValue: getRelForValue } = useRelativeScores(safeData);
  const { getForId: getAbsForId, getForValue: getAbsForValue } = useAbsoluteScore(safeData, {
    decimals: 0,
  });

  const absScoreById = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of safeData) {
      if (item?._id) map.set(item._id, getAbsForId(item._id));
    }
    return map;
  }, [safeData, getAbsForId]);

  return {
    safeData,
    dataById,
    getRelForId,
    getRelForValue,
    getAbsForId,
    getAbsForValue,
    absScoreById,
  };
}
