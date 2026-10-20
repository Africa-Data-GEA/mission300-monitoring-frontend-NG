import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api-client'
import { readRowProblems } from '@/features/data-submissions/lib/row-problems'

const problem = { row: 2, period: 'Q3 2026', field: 'Operational Mini-Grids', value: '-554', problem: 'cannot be negative.' }

describe('readRowProblems', () => {
  it('reads the rows a refused upload named', () => {
    const error = new ApiError(400, 'The file was not accepted', { problems: [problem] })
    expect(readRowProblems(error)).toEqual([problem])
  })

  it('keeps a blank value and a row-level problem with no field', () => {
    const rowLevel = { row: 3, period: '', field: null, value: null, problem: 'The Period is blank.' }
    expect(readRowProblems(new ApiError(400, 'x', { problems: [rowLevel] }))).toEqual([rowLevel])
  })

  it('drops entries that do not have the expected shape', () => {
    const error = new ApiError(400, 'x', { problems: [problem, { row: 'two' }, null, 'text'] })
    expect(readRowProblems(error)).toEqual([problem])
  })

  it('returns nothing for an error with no details', () => {
    expect(readRowProblems(new ApiError(409, 'A submission is already awaiting review.'))).toEqual([])
    expect(readRowProblems(new ApiError(400, 'x', { problems: 'nope' }))).toEqual([])
    expect(readRowProblems(new Error('network'))).toEqual([])
    expect(readRowProblems(undefined)).toEqual([])
  })
})
