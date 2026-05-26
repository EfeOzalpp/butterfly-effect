import type {Rule} from 'sanity'

interface PercentRange {
  minPct?: number
  maxPct?: number
}

interface PreviewSelection {
  a?: number
  b?: number
}

function isValidRange(value: unknown): true | string {
  const range = value as PercentRange | undefined
  return range &&
    typeof range.minPct === 'number' &&
    typeof range.maxPct === 'number' &&
    range.minPct <= range.maxPct
    ? true
    : 'minPct must be <= maxPct'
}

export default {
  name: 'gamificationPersonalizedCopy',
  title: 'Gamification Copy - Personalized',
  type: 'document',
  fields: [
    {
      name: 'range',
      title: 'Percent Range',
      type: 'object',
      fields: [
        {
          name: 'minPct',
          title: 'Min % (inclusive)',
          type: 'number',
          validation: (rule: Rule) => rule.required().min(0).max(100),
        },
        {
          name: 'maxPct',
          title: 'Max % (inclusive)',
          type: 'number',
          validation: (rule: Rule) => rule.required().min(0).max(100),
        },
      ],
      validation: (rule: Rule) => rule.custom(isValidRange),
    },
    {
      name: 'titles',
      title: 'Titles',
      type: 'array',
      of: [{type: 'string'}],
      validation: (rule: Rule) => rule.min(1),
    },
    {
      name: 'secondary',
      title: 'Secondary Pool',
      type: 'array',
      of: [{type: 'string'}],
      validation: (rule: Rule) => rule.min(1),
    },
    {name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true},
    {name: 'notes', title: 'Notes', type: 'text'},
  ],
  preview: {
    select: {a: 'range.minPct', b: 'range.maxPct'},
    prepare: ({a, b}: PreviewSelection) => ({title: `Personalized - ${String(a)}-${String(b)}%`}),
  },
}
