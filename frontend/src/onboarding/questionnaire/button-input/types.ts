export type LiveAvgButtonItem = {
  id: string;
  label: string;
  value: number;
  disabled?: boolean;
};

export type LiveAvgButtonChange = {
  activeIds: string[];
  activeItems: LiveAvgButtonItem[];
  liveAvg: number;
};
