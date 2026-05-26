import { filterRowsForSection, deriveSectionCounts } from "../survey-data-utils";

const makeRow = (section: string) => ({
  _id: `${section}-id`,
  section,
  q1: 0.5, q2: 0.5, q3: 0.5, q4: 0.5, q5: 0.5,
  avgWeight: 0.5,
  submittedAt: "2025-01-01",
  _createdAt: "2025-01-01",
  weights: { question1: 0.5, question2: 0.5, question3: 0.5, question4: 0.5, question5: 0.5 },
});

const rows = [
  makeRow("design"),
  makeRow("design"),
  makeRow("fine-arts"),
  makeRow("visitor"),
];

describe("filterRowsForSection", () => {
  test("'all' returns all rows", () => {
    expect(filterRowsForSection(rows as any, "all")).toHaveLength(4);
  });

  test("empty string returns all rows", () => {
    expect(filterRowsForSection(rows as any, "")).toHaveLength(4);
  });

  test("specific section filters correctly", () => {
    const result = filterRowsForSection(rows as any, "design");
    expect(result).toHaveLength(2);
    result.forEach((r) => expect(r.section).toBe("design"));
  });

  test("unknown section returns empty array", () => {
    expect(filterRowsForSection(rows as any, "nonexistent")).toHaveLength(0);
  });
});

describe("deriveSectionCounts", () => {
  test("'all' count equals total rows", () => {
    const counts = deriveSectionCounts(rows as any);
    expect(counts.all).toBe(4);
  });

  test("counts per section are correct", () => {
    const counts = deriveSectionCounts(rows as any);
    expect(counts["design"]).toBe(2);
    expect(counts["fine-arts"]).toBe(1);
    expect(counts["visitor"]).toBe(1);
  });

  test("empty array produces zero counts", () => {
    const counts = deriveSectionCounts([]);
    expect(counts.all).toBe(0);
    expect(counts.visitor).toBe(0);
  });
});
