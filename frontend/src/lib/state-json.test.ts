import { describe, expect, it } from 'vitest'
import { stateJson } from './state-json.js'

describe('stateJson', () => {
  it('is exactly JSON.stringify of the state', () => {
    const S = { unit: 'kg', gone: undefined, fn: () => 1, bad: NaN, workouts: [{ id: 'a', d: '2026-10-01', sets: [1, undefined] }], active: null, d: new Date(0) }
    expect(stateJson(S)).toBe(JSON.stringify(S))
    expect(stateJson({ workouts: [] })).toBe('{"workouts":[]}')
    expect(stateJson({ unit: 'kg' })).toBe('{"unit":"kg"}')
    expect(stateJson(null)).toBe('null')
  })

  it('reuses the history of the last write while it is the same array', () => {
    const workouts = [{ id: 'a' }, { id: 'b' }]
    const one = { unit: 'kg', workouts, active: { cur: 0 } }
    const two = { ...one, active: { cur: 1 } }
    expect(stateJson(one)).toBe(JSON.stringify(one))
    expect(stateJson(two)).toBe(JSON.stringify(two))
    const three = { ...two, workouts: [...workouts, { id: 'c' }] }
    expect(stateJson(three)).toBe(JSON.stringify(three))
  })

  it('refuses, under test, a history changed in place after it was written', () => {
    const workouts = [{ id: 'a' }]
    stateJson({ workouts })
    workouts[0].id = 'changed'
    expect(() => stateJson({ workouts })).toThrow(/changed in place/)
  })

  it('guarantees that application state export does not contain apiKey', () => {
    const S = {
      workouts: [],
      coach: {
        consent: { agreedAt: '2026-10-30T00:00:00Z', version: 1 },
        cadence: 'off',
        chat: []
      }
    }
    const json = stateJson(S)
    expect(json).not.toContain('apiKey')
    expect(JSON.parse(json).coach.apiKey).toBeUndefined()
  })
})
