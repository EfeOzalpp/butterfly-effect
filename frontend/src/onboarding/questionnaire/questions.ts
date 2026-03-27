// src/components/survey/questions/questions.ts
import type { Question } from '../types';

export const WEIGHTED_QUESTIONS: Question[] = [
  {
    id: 'q1',
    prompt: 'What\'s your usual commute for something simple?',
    required: true,
    options: [
      { key: 'A', label: 'Just walk or ride a bike', weight: 1 },
      { key: 'B', label: 'Take public transit or share a ride', weight: 0.75 },
      { key: 'C', label: 'Use a good ol\' car for short trips', weight: 0.05 },
      { key: 'D', label: 'An electric or hybrid car', weight: 0.3 },
    ],
  },
  {
    id: 'q2',
    prompt: 'Which best describes your eating habits?',
    required: true,
    options: [
      { key: 'A', label: 'Mostly plant-based or vegetarian meals', weight: 1.0 },
      { key: 'B', label: 'Plant-based, with a some animal meat or dairy', weight: 0.7 },
      { key: 'C', label: 'Mostly non-local sourced food, often imported meats', weight: 0.05 },
      { key: 'D', label: 'A mix, including meat or dairy a few times a week', weight: 0.5 },
    ],
  },
  {
    id: 'q3',
    prompt: 'How mindful are you about energy use at home?',
    required: true,
    options: [
      { key: 'A', label: "Turn things off when they're not in use", weight: 1.0 },
      { key: 'B', label: 'Try to save energy when possible', weight: 0.65 },
      { key: 'C', label: "Don't really pay attention to it", weight: 0.15 },
      { key: 'D', label: "Sometimes forget or don't think about it", weight: 0.35 },
    ],
  },
  {
    id: 'q4',
    prompt: 'When you shop, what feels most like you?',
    required: true,
    options: [
      { key: 'A', label: 'Look for thrift shop finds or things made to last', weight: 1.0 },
      { key: 'B', label: 'Shop from local stores and small brands you like', weight: 0.8 },
      { key: 'C', label: 'Buy brand-new things each time you need to', weight: 0.25 },
      { key: 'D', label: 'Buy from sustainable and transparent brands', weight: 0.6 },
    ],
  },
  {
    id: 'q5',
    prompt: 'How do you handle waste at home?',
    required: true,
    options: [
      { key: 'A', label: 'Sort thoroughly and compost organics whenever possible', weight: 1.0 },
      { key: 'B', label: 'Separate most recyclables regularly', weight: 0.7 },
      { key: 'C', label: 'Toss everything out together', weight: 0.0 },
      { key: 'D', label: "Recycle occasionally when it's convenient", weight: 0.45 },
    ],
  },
];
