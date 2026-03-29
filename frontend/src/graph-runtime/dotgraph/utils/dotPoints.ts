import type { Vec3, GeneratePositionsOptions } from "./positions";
import { generatePositions } from "./positions";
import { sampleStops, rgbString } from "../../../lib/utils/color-and-interpolation";

export type SurveyResponseLike = {
  _id?: string;
  avgWeight?: number;
  weights?: Record<string, unknown>;
};

export type DotPoint = {
  position: Vec3;
  originalPosition: Vec3;
  color: string;
  averageWeight: number;
  _id?: string;
};

export type DotPointsOptions = GeneratePositionsOptions & {
  colorForAverage?: (avg: number) => string;
  personalizedEntryId?: string | null;
  showPersonalized?: boolean;

  minDistance?: number;
  spreadOverride?: number;
  attractorStrength?: number;
};

const defaultColorForAverage = (avg: number) => rgbString(sampleStops(avg));
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const hashFromString = (value: string): number => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const hashUnit = (seed: number): number => {
  const x = Math.sin(seed * 12.9898) * 43758.5453123;
  return x - Math.floor(x);
};

const vecLength = (v: Vec3): number => Math.hypot(v[0], v[1], v[2]);

const normalizeVec = (v: Vec3): Vec3 => {
  const len = vecLength(v) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
};

const addVec = (a: Vec3, b: Vec3): Vec3 => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];

const scaleVec = (v: Vec3, s: number): Vec3 => [
  v[0] * s,
  v[1] * s,
  v[2] * s,
];

const tangentBasis = (n: Vec3): [Vec3, Vec3] => {
  const up: Vec3 = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  let ux = up[1] * n[2] - up[2] * n[1];
  let uy = up[2] * n[0] - up[0] * n[2];
  let uz = up[0] * n[1] - up[1] * n[0];
  const uLen = Math.hypot(ux, uy, uz) || 1;
  ux /= uLen;
  uy /= uLen;
  uz /= uLen;
  const u: Vec3 = [ux, uy, uz];
  const v: Vec3 = [
    n[1] * u[2] - n[2] * u[1],
    n[2] * u[0] - n[0] * u[2],
    n[0] * u[1] - n[1] * u[0],
  ];
  return [u, v];
};

const bucketForAverage = (avg: number): 0 | 1 | 2 => {
  if (avg < 0.34) return 0;
  if (avg > 0.66) return 2;
  return 1;
};

const clusterCountForBucket = (bucket: 0 | 1 | 2): number =>
  bucket === 1 ? 3 : 4;

const randomUnitVec = (seed: number): Vec3 => {
  const z = hashUnit(seed + 1) * 2 - 1;
  const theta = hashUnit(seed + 2) * Math.PI * 2;
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  return [r * Math.cos(theta), z, r * Math.sin(theta)];
};

const buildGalaxyCenters = (fieldRadius: number, seed: number): Record<0 | 1 | 2, Vec3[]> => {
  const makeBucket = (bucket: 0 | 1 | 2): Vec3[] => {
    const count = clusterCountForBucket(bucket);
    return Array.from({ length: count }, (_, i) => {
      const s = seed + bucket * 1009 + i * 131;
      const dir = randomUnitVec(s);
      const radiusK =
        bucket === 0 ? 0.56 + hashUnit(s + 11) * 0.28 :
        bucket === 2 ? 0.62 + hashUnit(s + 11) * 0.28 :
        0.4 + hashUnit(s + 11) * 0.24;
      return [
        dir[0] * fieldRadius * radiusK,
        dir[1] * fieldRadius * radiusK * 0.86,
        dir[2] * fieldRadius * radiusK,
      ];
    });
  };

  return {
    0: makeBucket(0),
    1: makeBucket(1),
    2: makeBucket(2),
  };
};

const galaxyPositionForAverage = (
  basePosition: Vec3,
  avg: number,
  seed: number,
  strength: number,
  centersByBucket: Record<0 | 1 | 2, Vec3[]>
): Vec3 => {
  const bucket = bucketForAverage(avg);
  const regionSeed = seed + Math.round(avg * 1000);
  const clusterCount = clusterCountForBucket(bucket);
  const clusterIndex = Math.floor(hashUnit(regionSeed + 5) * clusterCount);
  const clusterSeed = regionSeed + clusterIndex * 101;
  const isLoner = hashUnit(regionSeed + 71) < 0.16;
  const clusterCenter = centersByBucket[bucket][clusterIndex] ?? [0, 0, 0];

  if (isLoner) {
    const lonerT = 0.24 + strength * 0.08;
    const lonerDir = normalizeVec([
      basePosition[0] + (hashUnit(clusterSeed + 11) - 0.5) * 8,
      basePosition[1] + (hashUnit(clusterSeed + 23) - 0.5) * 5,
      basePosition[2] + (hashUnit(clusterSeed + 37) - 0.5) * 8,
    ]);
    const lonerRadius = Math.max(6, vecLength(basePosition) * (1.04 + hashUnit(clusterSeed + 53) * 0.18));
    return addVec(
      scaleVec(basePosition, 1 - lonerT),
      scaleVec(lonerDir, lonerRadius * lonerT)
    );
  }

  const jitterAmp = 0.22;
  const jitter: Vec3 = [
    (hashUnit(clusterSeed + 11) - 0.5) * jitterAmp,
    (hashUnit(clusterSeed + 23) - 0.5) * jitterAmp * 0.72,
    (hashUnit(clusterSeed + 37) - 0.5) * jitterAmp,
  ];
  const clusterDir = normalizeVec([
    clusterCenter[0] + jitter[0],
    clusterCenter[1] + jitter[1],
    clusterCenter[2] + jitter[2],
  ]);
  const [u, v] = tangentBasis(clusterDir);
  const baseRadius = Math.max(8, vecLength(basePosition));

  const armCount = bucket === 1 ? 2 : 3;
  const armIndex = Math.floor(hashUnit(clusterSeed + 61) * armCount);
  const armPhase = (armIndex / armCount) * Math.PI * 2;
  const localT = hashUnit(seed + 79);
  const armAngle = armPhase + localT * Math.PI * (1.25 + strength * 0.75);
  const swirlRadius =
    (10 + baseRadius * 0.18) *
    (0.3 + localT * 1.15) *
    (0.95 + hashUnit(seed + 83) * 0.35);
  const depthOffset = (hashUnit(seed + 97) - 0.5) * (5.5 + baseRadius * 0.06);

  const localOffset = addVec(
    addVec(
      scaleVec(u, Math.cos(armAngle) * swirlRadius),
      scaleVec(v, Math.sin(armAngle) * swirlRadius * 0.72)
    ),
    scaleVec(clusterDir, depthOffset)
  );

  const clusterPos = addVec(clusterCenter, localOffset);
  const keepField = clamp01(0.18 - strength * 0.08);
  return addVec(scaleVec(basePosition, keepField), scaleVec(clusterPos, 1 - keepField));
};

const computeLocalAvg = (response: SurveyResponseLike): number | undefined => {
  const w = response?.weights;
  if (!w || typeof w !== 'object') return undefined;
  const vals = Object.values(w).filter((x): x is number => Number.isFinite(x));
  if (!vals.length) return undefined;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
};

export function computeDotPoints(
  data: SurveyResponseLike[],
  opts: DotPointsOptions = {}
): DotPoint[] {
  const safe = Array.isArray(data) ? data : [];
  const n = safe.length;
  if (n === 0) return [];

  const {
    colorForAverage = defaultColorForAverage,
    personalizedEntryId,
    showPersonalized = false,

    minDistance = 2.5,
    spreadOverride,
    attractorStrength = 0.28,

    // pass-through to generatePositions
    baseRadius,
    densityK,
    maxRadiusCap,
    yaw,
    pitch,
    roll,
    jitterAmp,
    relaxPasses,
    relaxStrength,
    seed,

    tightRefN,
    baseRadiusTight,
    tightMaxAlpha,
    tightCurve,
  } = opts;

  const base = generatePositions(
    n,
    minDistance,
    spreadOverride,
    {
      baseRadius,
      densityK,
      maxRadiusCap,
      yaw,
      pitch,
      roll,
      jitterAmp,
      relaxPasses,
      relaxStrength,
      seed,
      tightRefN,
      baseRadiusTight,
      tightMaxAlpha,
      tightCurve,
    }
  );
  const fieldRadius = Math.max(
    spreadOverride ?? 0,
    ...base.map((p) => vecLength(p))
  );
  const centersByBucket = buildGalaxyCenters(Math.max(18, fieldRadius), seed ?? 1337);

  const pts: DotPoint[] = safe.map((response, i) => {
    const rawAvg =
      typeof response?.avgWeight === 'number' && Number.isFinite(response.avgWeight)
        ? response.avgWeight
        : computeLocalAvg(response);

    // Guarantee a real number no matter what:
    const avg: number =
      typeof rawAvg === 'number' && Number.isFinite(rawAvg) ? rawAvg : 0.5;

    // Guarantee a Vec3 (TS can't prove base[i] exists)
    const pos: Vec3 = base[i] ?? [0, 0, 0];
    const stableSeed = hashFromString(response?._id ?? `dot-${i}`);
    const attractedPos = galaxyPositionForAverage(
      pos,
      avg,
      stableSeed,
      attractorStrength,
      centersByBucket
    );

    return {
      position: attractedPos,
      originalPosition: attractedPos,
      color: colorForAverage(avg),
      averageWeight: avg,
      _id: response?._id,
    };
  });

  if (showPersonalized && personalizedEntryId) {
    const mine = pts.find((p) => p._id === personalizedEntryId);
    if (mine) {
      mine.position = [0, 0, 0];
      mine.originalPosition = [0, 0, 0];
    }
  }

  return pts;
}
