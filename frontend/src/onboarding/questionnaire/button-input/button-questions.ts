export type ButtonQuestion = {
  id: string;
  prompt: string;
  options: { key: string; label: string; weight: number }[];
};

export const BUTTON_QUESTIONS: ButtonQuestion[] = [
  {
    id: 'q1',
    prompt: "What's your usual commute?",
    options: [
      { key: 'A', label: 'On foot',  weight: 1.0  },
      { key: 'B', label: 'By bike',  weight: 0.95 },
      { key: 'C', label: 'Transit',  weight: 0.75 },
      { key: 'D', label: 'Carpool',  weight: 0.55 },
      { key: 'E', label: 'Electric', weight: 0.3  },
      { key: 'F', label: 'Drive',    weight: 0.05 },
    ],
  },
  {
    id: 'q2',
    prompt: 'Which best describes your eating habits?',
    options: [
      { key: 'A', label: 'All plants',     weight: 1.0  },
      { key: 'B', label: 'Mostly veggies',     weight: 0.75 },
      { key: 'C', label: 'Some meat',      weight: 0.55  },
      { key: 'D', label: 'Lots of dairy',  weight: 0.45 },
      { key: 'E', label: 'Meat daily',     weight: 0.25 },
      { key: 'F', label: 'Imported',     weight: 0.05 },
      { key: 'G', label: 'Local',     weight: 0.9 },
    ],
  },
  {
    id: 'q3',
    prompt: 'How mindful are you about energy use at home?',
    options: [
      { key: 'A', label: 'Obsessively', weight: 1.0  },
      { key: 'B', label: 'Mindfully',   weight: 0.75 },
      { key: 'C', label: 'Sometimes',   weight: 0.45 },
      { key: 'D', label: 'Rarely',      weight: 0.2  },
      { key: 'E', label: 'Never',       weight: 0.05 },
    ],
  },
  {
    id: 'q4',
    prompt: 'When you shop, what feels most like you?',
    options: [
      { key: 'A', label: 'Thrift always', weight: 1.0  },
      { key: 'B', label: 'Buy to last',   weight: 0.8  },
      { key: 'C', label: 'Shop local',    weight: 0.65 },
      { key: 'D', label: 'Eco brands',    weight: 0.5  },
      { key: 'E', label: 'Buy new',       weight: 0.2  },
      { key: 'F', label: 'Fast fashion',  weight: 0.0  },
    ],
  },
  {
    id: 'q5',
    prompt: 'How do you handle waste at home?',
    options: [
      { key: 'A', label: 'Compost',        weight: 1.0  },
      { key: 'B', label: 'Sort carefully', weight: 0.75 },
      { key: 'C', label: 'Just recycle',   weight: 0.5  },
      { key: 'D', label: 'Sometimes',      weight: 0.25 },
      { key: 'E', label: 'Toss all',       weight: 0.0  },
    ],
  },
];
