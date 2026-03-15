import { useMemo } from 'react';
import type { DotPoint, DotPointsOptions, SurveyResponseLike } from '../utils/dotPoints';
import { computeDotPoints } from '../utils/dotPoints';

export default function useDotPoints(
  data: SurveyResponseLike[],
  opts: DotPointsOptions = {}
): DotPoint[] {
  return useMemo(() => computeDotPoints(data, opts), [data, opts]);
}
