import { describe, expect, it } from 'vitest'
import { gridPayload, newGridRow, rowsMissingChoices } from '@/features/data-submissions/lib/entry-grid'

describe('entry grid rows', () => {
  it('sends the DisCo only for a consolidated dataset', () => {
    const row = { ...newGridRow('Q3 2026', 'Ikeja Electric'), values: { f1: '10' } }
    expect(gridPayload([row], true)).toEqual([{ period: 'Q3 2026', institution: 'Ikeja Electric', values: { f1: '10' } }])
    expect(gridPayload([row], false)).toEqual([{ period: 'Q3 2026', values: { f1: '10' } }])
  })

  it('asks for a DisCo on every row of a consolidated dataset', () => {
    expect(rowsMissingChoices([newGridRow('Q3 2026')], true)).toBe('Row 1: choose the DisCo and the period.')
    expect(rowsMissingChoices([newGridRow('Q3 2026', 'Ikeja Electric')], true)).toBeNull()
  })

  it('asks for a period when one is missing', () => {
    expect(rowsMissingChoices([newGridRow('')], false)).toBe('Row 1: choose the period.')
  })

  it('needs at least one row and names the first unfinished row', () => {
    expect(rowsMissingChoices([], false)).toBe('Add at least one row.')
    expect(rowsMissingChoices([newGridRow('Q3 2026', 'A'), newGridRow('Q3 2026')], true)).toMatch(/^Row 2/)
  })

  it('gives every new row its own key', () => {
    expect(newGridRow('Q3 2026').key).not.toBe(newGridRow('Q3 2026').key)
  })
})
