// src/onboarding/types.ts
export interface Option { key: string; label: string; weight: number }
export interface Question {
  id: string;
  prompt: string;
  options: Option[];
  required?: boolean;
}
