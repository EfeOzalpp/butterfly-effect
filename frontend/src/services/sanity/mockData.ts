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

const MOCK_SEEDS: Array<[string, number, number, number, number, number]> = [
  ['animation', 0.74, 0.67, 0.81, 0.69, 0.73],
  ['illustration', 0.61, 0.58, 0.64, 0.62, 0.57],
  ['fine-arts-2d', 0.48, 0.52, 0.51, 0.46, 0.49],
  ['communication-design', 0.83, 0.78, 0.81, 0.76, 0.79],
  ['visitor', 0.39, 0.42, 0.44, 0.41, 0.4],
  ['academic-resource-center', 0.56, 0.6, 0.58, 0.62, 0.59],
  ['industrial-design', 0.72, 0.75, 0.71, 0.7, 0.73],
  ['student-engagement', 0.54, 0.5, 0.55, 0.57, 0.53],
  ['photography', 0.68, 0.66, 0.7, 0.72, 0.67],
  ['architecture', 0.77, 0.74, 0.8, 0.76, 0.79],
  ['painting', 0.45, 0.49, 0.46, 0.47, 0.44],
  ['visitor', 0.34, 0.37, 0.35, 0.38, 0.36],
  ['illustration', 0.64, 0.63, 0.67, 0.61, 0.65],
  ['design-innovation', 0.86, 0.84, 0.82, 0.87, 0.85],
  ['academic-resource-center', 0.52, 0.55, 0.57, 0.54, 0.56],
  ['technology', 0.69, 0.71, 0.68, 0.7, 0.72],
  ['animation', 0.79, 0.76, 0.8, 0.78, 0.77],
  ['photography', 0.58, 0.61, 0.57, 0.6, 0.59],
  ['student-engagement', 0.49, 0.5, 0.52, 0.48, 0.51],
  ['industrial-design', 0.75, 0.77, 0.73, 0.74, 0.76],
  ['architecture', 0.82, 0.79, 0.81, 0.8, 0.83],
  ['visitor', 0.43, 0.41, 0.46, 0.44, 0.42],
  ['animation', 0.71, 0.73, 0.69, 0.74, 0.72],
  ['illustration', 0.59, 0.6, 0.62, 0.58, 0.61],
  ['dynamic-media-institute', 0.88, 0.86, 0.87, 0.85, 0.89],
  ['academic-resource-center', 0.6, 0.57, 0.61, 0.59, 0.58],
  ['technology', 0.66, 0.67, 0.69, 0.65, 0.68],
  ['studio-arts', 0.51, 0.53, 0.54, 0.52, 0.5],
  ['photography', 0.7, 0.69, 0.68, 0.71, 0.72],
  ['student-engagement', 0.47, 0.46, 0.49, 0.5, 0.48],
];

const BASE_ROWS: MockRow[] = MOCK_SEEDS.map(([section, q1, q2, q3, q4, q5], index) => {
  const avgWeight = Number(((q1 + q2 + q3 + q4 + q5) / 5).toFixed(3));
  const submitted = new Date(Date.UTC(2026, 2, 15, 16, 0 - index * 3, 0)).toISOString();
  return {
    _id: `mock-seed-${index + 1}`,
    _type: 'userResponseV4',
    section,
    q1,
    q2,
    q3,
    q4,
    q5,
    avgWeight,
    submittedAt: submitted,
    _createdAt: submitted,
    _updatedAt: submitted,
  };
});

const STUDENT_SECTIONS = new Set([
  'animation',
  'illustration',
  'fine-arts-2d',
  'communication-design',
  'design-innovation',
  'dynamic-media-institute',
  'industrial-design',
  'architecture',
  'photography',
  'painting',
  'studio-arts',
]);

const STAFF_SECTIONS = new Set([
  'academic-resource-center',
  'student-engagement',
  'technology',
]);

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
      rows = rows.filter((row) => row.section !== 'visitor');
    } else if (section === 'all-students') {
      rows = rows.filter((row) => STUDENT_SECTIONS.has(row.section));
    } else if (section === 'all-staff') {
      rows = rows.filter((row) => STAFF_SECTIONS.has(row.section));
    } else {
      rows = rows.filter((row) => row.section === section);
    }
  }
  return rows.slice(0, limit);
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
