// src/services/sanity/types.ts
// Service contracts for Sanity rows before and after normalization.

import type { SurveyRow } from "../../app/types";

export interface SurveyWeights {
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
  q5?: number;
}

export interface RawSurveyRow extends SurveyWeights {
  _id: string;
  _type?: "userResponseV4";
  _createdAt?: string;
  _updatedAt?: string;
  section?: string;
  avgWeight?: number;
  submittedAt?: string;
}

export type NormalizedSurveyRow = SurveyRow;

export type Unsubscribe = () => void;

export interface SubscribeSurveyDataArgs {
  section: string;
  limit?: number;
  onData: (rows: SurveyRow[]) => void;
}

export interface QueryAndParams {
  query: string;
  params: Record<string, unknown>;
}
