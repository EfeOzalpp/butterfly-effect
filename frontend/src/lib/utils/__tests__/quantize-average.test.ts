import { quantizeAvg } from "../quantize-average";

describe("quantizeAvg", () => {
  test.each([
    [0, 24, 0],
    [1, 24, 1],
  ])("avg=%s bins=%s snaps correctly", (avg, bins, expected) => {
    expect(quantizeAvg(avg, bins)).toEqual(expected);
  });

  test("clamps negative input to 0", () => {
    expect(quantizeAvg(-1)).toBe(0);
  });

  test("clamps input above 1 to 1", () => {
    expect(quantizeAvg(2)).toBe(1);
  });

  test("NaN falls back to 0.5 before quantizing - result is in [0, 1]", () => {
    const result = quantizeAvg(NaN);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  test("result is always in [0, 1]", () => {
    [0.1, 0.37, 0.72, 0.99].forEach((v) => {
      const result = quantizeAvg(v);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  test("same input always returns same value", () => {
    expect(quantizeAvg(0.6, 10)).toBe(quantizeAvg(0.6, 10));
  });
});
