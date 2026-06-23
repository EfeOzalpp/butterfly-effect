import { classifyPosition } from "../rankLogic";

describe("classifyPosition", () => {
  test("solo when no others", () => {
    expect(classifyPosition({ below: 0, equal: 0, above: 0, totalOthers: 0 }))
      .toEqual({ position: "solo", tieContext: "none" });
  });

  test("top with no ties", () => {
    expect(classifyPosition({ below: 5, equal: 0, above: 0, totalOthers: 5 }))
      .toEqual({ position: "top", tieContext: "none" });
  });

  test("top with ties", () => {
    expect(classifyPosition({ below: 3, equal: 2, above: 0, totalOthers: 5 }))
      .toEqual({ position: "top", tieContext: "top" });
  });

  test("bottom with no ties", () => {
    expect(classifyPosition({ below: 0, equal: 0, above: 5, totalOthers: 5 }))
      .toEqual({ position: "bottom", tieContext: "none" });
  });

  test("bottom with ties", () => {
    expect(classifyPosition({ below: 0, equal: 2, above: 3, totalOthers: 5 }))
      .toEqual({ position: "bottom", tieContext: "bottom" });
  });

  test("middle with ties", () => {
    expect(classifyPosition({ below: 2, equal: 3, above: 2, totalOthers: 7 }))
      .toEqual({ position: "middle", tieContext: "middle" });
  });

  test("middle-above when more below than above", () => {
    expect(classifyPosition({ below: 5, equal: 0, above: 2, totalOthers: 7 }))
      .toEqual({ position: "middle-above", tieContext: "none" });
  });

  test("middle-below when more above than below", () => {
    expect(classifyPosition({ below: 2, equal: 0, above: 5, totalOthers: 7 }))
      .toEqual({ position: "middle-below", tieContext: "none" });
  });

  test("middle when below equals above with no ties", () => {
    expect(classifyPosition({ below: 3, equal: 0, above: 3, totalOthers: 6 }))
      .toEqual({ position: "middle", tieContext: "none" });
  });
});
