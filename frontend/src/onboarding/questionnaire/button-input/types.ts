export interface LiveAvgButtonItem {
  id: string;
  label: string;
  value: number;
  disabled?: boolean;
}

export interface LiveAvgButtonChange {
  activeIds: string[];
  activeItems: LiveAvgButtonItem[];
  liveAvg: number;
}
