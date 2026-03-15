export type DebugFlags = {
  grid: boolean;
  gridAlpha: number;
  forbiddenAlpha: number;
};

export const DEBUG_DEFAULT: DebugFlags = {
  grid: false, // toggle grid visibility
  gridAlpha: 0.3,
  forbiddenAlpha: 0.25,
};
