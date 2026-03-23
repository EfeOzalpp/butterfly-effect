export type Mode = "relative" | "absolute";

export type SurveyRow = {
  _id: string;
  section: string;
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
  q5?: number;
  avgWeight?: number;
  submittedAt?: string;
  _createdAt: string;
  weights: {
    question1: number;
    question2: number;
    question3: number;
    question4: number;
    question5: number;
  };
};

export type CondAvgs = Partial<Record<"A" | "B" | "C" | "D", number>>;
