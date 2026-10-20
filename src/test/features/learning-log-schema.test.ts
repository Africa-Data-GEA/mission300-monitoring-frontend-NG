import { describe, expect, it } from 'vitest'
import { createLearningLogEntryRequestSchema } from '@/api/schemas/learning-log'

const base = { title: 'A useful title', area: 'data-governance', reviewCycle: 'Q4 2026 review' } as const

const messages = (input: object) => {
  const result = createLearningLogEntryRequestSchema.safeParse(input)
  return result.success ? [] : result.error.issues.map((issue) => issue.message)
}

describe('logging a decision', () => {
  it('needs what was decided and why', () => {
    expect(messages({ ...base, entryType: 'decision', status: 'proposed' })).toEqual(
      expect.arrayContaining(['Describe what was decided or proposed', 'Describe why']),
    )
  })

  it('is accepted with both', () => {
    expect(
      messages({ ...base, entryType: 'decision', status: 'decided', decision: 'Split the KPI in two', rationale: 'It mixed two measures' }),
    ).toEqual([])
  })
})

describe('logging a learning', () => {
  it('needs what happened and what was learned, not a decision', () => {
    const problems = messages({ ...base, entryType: 'learning', status: 'captured' })
    expect(problems).toEqual(expect.arrayContaining(['Describe what happened', 'Describe what was learned']))
    expect(problems).not.toContain('Describe what was decided or proposed')
  })

  it('is accepted with context and a lesson, with the rest optional', () => {
    expect(
      messages({ ...base, entryType: 'learning', status: 'captured', context: 'Two DisCos sent late files', lesson: 'Late files delay the roll-up' }),
    ).toEqual([])
  })
})
