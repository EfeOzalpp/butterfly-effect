export type Mode = "relative" | "absolute";

export type CondAvgs = Partial<Record<"A" | "B" | "C" | "D", number>>;

export type AppState = {
  section: string;
  setSection: (s: string) => void;

  mySection: string | null;
  setMySection: (s: string | null) => void;

  myEntryId: string | null;
  setMyEntryId: (id: string | null) => void;

  myRole: string | null;
  setMyRole: (r: string | null) => void;

  data: any[];
  loading: boolean;

  isSurveyActive: boolean;
  setSurveyActive: (v: boolean) => void;
  hasCompletedSurvey: boolean;
  setHasCompletedSurvey: (v: boolean) => void;

  questionnaireOpen: boolean;
  setQuestionnaireOpen: (v: boolean) => void;

  sectionOpen: boolean;
  setSectionOpen: (v: boolean) => void;

  observerMode: boolean;
  setObserverMode: (v: boolean) => void;

  vizVisible: boolean;
  openGraph: () => void;
  closeGraph: () => void;

  mode: Mode;
  setMode: (m: Mode) => void;

  darkMode: boolean;
  setDarkMode: (v: boolean) => void;

  navPanelOpen: boolean;
  setNavPanelOpen: (v: boolean) => void;

  navVisible: boolean;
  setNavVisible: (v: boolean) => void;

  liveAvg: number;
  setLiveAvg: (avg?: number) => void;

  condAvgs: CondAvgs;
  setCondAvgs: (avgs: CondAvgs) => void;

  allocAvg: number;
  commitAllocAvg: (avg?: number) => void;

  resetToStart: () => void;
};
