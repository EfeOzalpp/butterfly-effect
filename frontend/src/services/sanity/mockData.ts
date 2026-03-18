import { normalizeSurveyRow } from './normalizeSurveyRow';
import { NON_VISITOR_MASSART, STAFF_IDS, STUDENT_IDS } from './sections';

type MockWeights = { q1?: number; q2?: number; q3?: number; q4?: number; q5?: number };

export type MockRow = {
  _id: string;
  _type: 'userResponseV4';
  _createdAt: string;
  _updatedAt: string;
  section: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  avgWeight: number;
  submittedAt: string;
};

const MOCK_STORAGE_KEY = 'gp.mockRows';
const TARGET_BASE_ROW_COUNT = 800;

const MOCK_SEEDS: Array<[string, number, number, number, number, number]> = [
  ['animation',                0.38, 0.42, 0.35, 0.40, 0.37],   // low
  ['animation',                0.77, 0.74, 0.80, 0.76, 0.78],   // high
  ['illustration',             0.48, 0.51, 0.46, 0.50, 0.47],   // mid
  ['illustration',             0.62, 0.58, 0.64, 0.60, 0.61],   // mid-high
  ['fine-arts-2d',             0.30, 0.34, 0.32, 0.28, 0.31],   // low
  ['fine-arts-2d',             0.54, 0.57, 0.51, 0.55, 0.53],   // mid
  ['communication-design',     0.29, 0.33, 0.35, 0.27, 0.31],   // low
  ['communication-design',     0.84, 0.80, 0.82, 0.78, 0.81],   // high
  ['visitor',                  0.45, 0.48, 0.43, 0.47, 0.46],   // mid-low
  ['visitor',                  0.63, 0.60, 0.66, 0.58, 0.62],   // mid-high
  ['academic-resource-center', 0.37, 0.41, 0.39, 0.43, 0.38],   // low
  ['academic-resource-center', 0.57, 0.53, 0.60, 0.55, 0.58],   // mid
  ['industrial-design',        0.34, 0.38, 0.36, 0.40, 0.35],   // low
  ['industrial-design',        0.76, 0.73, 0.79, 0.74, 0.77],   // high
  ['student-engagement',       0.26, 0.30, 0.32, 0.25, 0.28],   // low
  ['student-engagement',       0.50, 0.54, 0.48, 0.52, 0.51],   // mid
  ['photography',              0.27, 0.31, 0.29, 0.25, 0.28],   // low
  ['photography',              0.56, 0.60, 0.53, 0.58, 0.55],   // mid
  ['architecture',             0.40, 0.44, 0.42, 0.38, 0.41],   // low
  ['architecture',             0.81, 0.78, 0.84, 0.80, 0.83],   // high
  ['painting',                 0.33, 0.37, 0.35, 0.31, 0.34],   // low
  ['painting',                 0.52, 0.56, 0.49, 0.54, 0.53],   // mid
  ['design-innovation',        0.28, 0.32, 0.30, 0.34, 0.27],   // low
  ['design-innovation',        0.87, 0.84, 0.89, 0.85, 0.88],   // high
  ['dynamic-media-institute',  0.31, 0.35, 0.28, 0.37, 0.30],   // low
  ['dynamic-media-institute',  0.88, 0.85, 0.91, 0.86, 0.89],   // high
  ['technology',               0.33, 0.37, 0.35, 0.31, 0.34],   // low
  ['technology',               0.59, 0.55, 0.62, 0.57, 0.60],   // mid
  ['studio-arts',              0.25, 0.29, 0.31, 0.27, 0.26],   // low
  ['studio-arts',              0.49, 0.52, 0.46, 0.54, 0.50],   // mid
];

function offsetWeight(value: number, delta: number) {
  return Math.max(0, Math.min(1, Math.round((value + delta) * 1000) / 1000));
}

function buildBaseRows(): MockRow[] {
  return Array.from({ length: TARGET_BASE_ROW_COUNT }, (_, index) => {
    const [section, q1, q2, q3, q4, q5] = MOCK_SEEDS[index % MOCK_SEEDS.length];
    const cycle = Math.floor(index / MOCK_SEEDS.length);
    const drift = ((index % 7) - 3) * 0.009 + cycle * 0.006;
    const values = [
      offsetWeight(q1, drift),
      offsetWeight(q2, drift * 0.7),
      offsetWeight(q3, -drift * 0.45),
      offsetWeight(q4, drift * 0.55),
      offsetWeight(q5, -drift * 0.3),
    ] as const;
    const avgWeight = Number(
      ((values[0] + values[1] + values[2] + values[3] + values[4]) / 5).toFixed(3)
    );
    const submitted = new Date(Date.UTC(2026, 2, 15, 16, 0 - index * 3, 0)).toISOString();
    return {
      _id: `mock-seed-${index + 1}`,
      _type: 'userResponseV4',
      section,
      q1: values[0],
      q2: values[1],
      q3: values[2],
      q4: values[3],
      q5: values[4],
      avgWeight,
      submittedAt: submitted,
      _createdAt: submitted,
      _updatedAt: submitted,
    };
  });
}

const BASE_ROWS: MockRow[] = buildBaseRows();

const STUDENT_SECTIONS = new Set(STUDENT_IDS);
const STAFF_SECTIONS = new Set(STAFF_IDS);

type SurveySubscriber = {
  section: string;
  limit: number;
  onData: (rows: MockRow[]) => void;
};

const surveySubscribers = new Set<SurveySubscriber>();
const countSubscribers = new Set<(counts: Record<string, number>) => void>();

const sortNewestFirst = (a: MockRow, b: MockRow) =>
  Date.parse(b.submittedAt) - Date.parse(a.submittedAt);

const clamp01 = (v?: number) =>
  typeof v === 'number' ? Math.max(0, Math.min(1, v)) : undefined;

const round3 = (v?: number) =>
  typeof v === 'number' ? Math.round(v * 1000) / 1000 : undefined;

const computeAvg = (weights: MockWeights) => {
  const vals = [weights.q1, weights.q2, weights.q3, weights.q4, weights.q5].filter(
    (x): x is number => Number.isFinite(x)
  );
  if (!vals.length) return undefined;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
};

function readStoredRows(): MockRow[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(MOCK_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredRows(rows: MockRow[]) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(rows));
  } catch {}
}

function allRows() {
  return [...BASE_ROWS, ...readStoredRows()].sort(sortNewestFirst);
}

function filterRows(section: string, limit: number) {
  let rows = allRows();
  if (section && section !== 'all') {
    if (section === 'all-massart') {
      rows = rows.filter((row) => NON_VISITOR_MASSART.includes(row.section));
    } else if (section === 'all-students') {
      rows = rows.filter((row) => STUDENT_SECTIONS.has(row.section));
    } else if (section === 'all-staff') {
      rows = rows.filter((row) => STAFF_SECTIONS.has(row.section));
    } else {
      rows = rows.filter((row) => row.section === section);
    }
  }
  return rows.slice(0, limit).map(normalizeSurveyRow);
}

function buildCounts(rows: MockRow[]) {
  const bySection: Record<string, number> = {};
  for (const row of rows) {
    bySection[row.section] = (bySection[row.section] || 0) + 1;
  }
  const sum = (matcher: (section: string) => boolean) =>
    Object.entries(bySection).reduce((acc, [section, count]) => acc + (matcher(section) ? count : 0), 0);

  return {
    all: rows.length,
    'all-massart': sum((section) => section !== 'visitor'),
    'all-students': sum((section) => STUDENT_SECTIONS.has(section)),
    'all-staff': sum((section) => STAFF_SECTIONS.has(section)),
    visitor: bySection.visitor || 0,
    ...bySection,
  };
}

function notifyAllSubscribers() {
  surveySubscribers.forEach(({ section, limit, onData }) => {
    onData(filterRows(section, limit));
  });
  const counts = buildCounts(allRows());
  countSubscribers.forEach((onData) => onData(counts));
}

export function subscribeMockSurveyData({
  section,
  limit = 300,
  onData,
}: {
  section: string;
  limit?: number;
  onData: (rows: MockRow[]) => void;
}) {
  const subscriber: SurveySubscriber = { section, limit, onData };
  surveySubscribers.add(subscriber);
  const timer = window.setTimeout(() => onData(filterRows(section, limit)), 0);
  return () => {
    window.clearTimeout(timer);
    surveySubscribers.delete(subscriber);
  };
}

export function fetchMockSurveyData(
  callback: (rows: MockRow[]) => void,
  { limit = 300 }: { limit?: number } = {}
) {
  const timer = window.setTimeout(() => callback(filterRows('all', limit)), 0);
  return () => window.clearTimeout(timer);
}

export function subscribeMockSectionCounts({ onData }: { onData: (counts: Record<string, number>) => void }) {
  countSubscribers.add(onData);
  const timer = window.setTimeout(() => onData(buildCounts(allRows())), 0);
  return () => {
    window.clearTimeout(timer);
    countSubscribers.delete(onData);
  };
}

export function createMockUserResponse(section: string, weights: MockWeights) {
  const clamped: MockWeights = {
    q1: round3(clamp01(weights.q1)),
    q2: round3(clamp01(weights.q2)),
    q3: round3(clamp01(weights.q3)),
    q4: round3(clamp01(weights.q4)),
    q5: round3(clamp01(weights.q5)),
  };

  const now = new Date().toISOString();
  const avgWeight = round3(computeAvg(clamped));
  const created: MockRow = {
    _id: `mock-user-${Date.now()}`,
    _type: 'userResponseV4',
    section,
    q1: clamped.q1 ?? 0.5,
    q2: clamped.q2 ?? 0.5,
    q3: clamped.q3 ?? 0.5,
    q4: clamped.q4 ?? 0.5,
    q5: clamped.q5 ?? 0.5,
    avgWeight: avgWeight ?? 0.5,
    submittedAt: now,
    _createdAt: now,
    _updatedAt: now,
  };

  const nextRows = [...readStoredRows(), created].sort(sortNewestFirst);
  writeStoredRows(nextRows);
  notifyAllSubscribers();
  return created;
}

export function clearMockSurveyState() {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(MOCK_STORAGE_KEY);
    } catch {}
  }
  notifyAllSubscribers();
}
