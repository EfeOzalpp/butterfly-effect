import { useMemo } from 'react';
import type { DotPoint, DotPointsOptions, SurveyResponseLike } from '../utils/dotPoints';
import { computeDotPoints } from '../utils/dotPoints';

type ObjectArg = ({ data?: SurveyResponseLike[] } & DotPointsOptions);

// overload 1: (data, opts?)
export default function useDotPoints(data: SurveyResponseLike[], opts?: DotPointsOptions): DotPoint[];
// overload 2: ({data, ...opts})
export default function useDotPoints(arg: ObjectArg): DotPoint[];

// implementation
export default function useDotPoints(
  arg1: SurveyResponseLike[] | ObjectArg,
  arg2?: DotPointsOptions
): DotPoint[] {
  const isArrayCall = Array.isArray(arg1);

  const data: SurveyResponseLike[] = isArrayCall ? arg1 : (arg1.data ?? []);
  const opts: DotPointsOptions = isArrayCall ? (arg2 ?? {}) : arg1;

  return useMemo(() => computeDotPoints(data, opts), [data, opts]);
}