import { computeRealtimeAverage } from "../live-average";

describe("computeRealtimeAverage", () => {
  test("returns undefined for empty object", () => {
    expect(computeRealtimeAverage({})).toBeUndefined();
  });

  test("returns undefined when all values are undefined", () => {
    expect(computeRealtimeAverage({ a: undefined, b: undefined })).toBeUndefined();
  });

  test("returns the single finite value", () => {
    expect(computeRealtimeAverage({ a: 0.8, b: undefined })).toBe(0.8);
  });

  test("computes average of multiple finite values", () => {
    expect(computeRealtimeAverage({ a: 0.2, b: 0.6, c: 1.0 })).toBeCloseTo(0.6, 10);
  });

  test("ignores NaN values", () => {
    expect(computeRealtimeAverage({ a: 0.5, b: NaN })).toBe(0.5);
  });

  test("returns 0 when all values are 0", () => {
    expect(computeRealtimeAverage({ a: 0, b: 0 })).toBe(0);
  });
});
