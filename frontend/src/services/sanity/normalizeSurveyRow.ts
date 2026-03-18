const round3 = (v?: number) =>
  typeof v === 'number' ? Math.round(v * 1000) / 1000 : undefined;

export function normalizeSurveyRow<T extends {
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
  q5?: number;
  avgWeight?: number;
}>(row: T) {
  const q1 = round3(row.q1);
  const q2 = round3(row.q2);
  const q3 = round3(row.q3);
  const q4 = round3(row.q4);
  const q5 = round3(row.q5);
  const avgWeight = round3(row.avgWeight);

  return {
    ...row,
    q1,
    q2,
    q3,
    q4,
    q5,
    avgWeight,
    weights: {
      question1: q1 ?? 0.5,
      question2: q2 ?? 0.5,
      question3: q3 ?? 0.5,
      question4: q4 ?? 0.5,
      question5: q5 ?? 0.5,
    },
  };
}
