// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@aparajita/capacitor-secure-storage', () => {
  throw new Error('plugin not installed')
})

const secrets = await import('./coach-secrets.js')

describe('coach-secrets in browser web / PWA without native plugin', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persists API key in localStorage across gets and sets', async () => {
    await secrets.setApiKey('sk-ant-test-key-123')
    expect(localStorage.getItem('coach.apiKey')).toBe('sk-ant-test-key-123')
    expect(await secrets.getApiKey()).toBe('sk-ant-test-key-123')
  })

  it('clears API key from localStorage', async () => {
    await secrets.setApiKey('sk-ant-test-key-456')
    expect(await secrets.getApiKey()).toBe('sk-ant-test-key-456')
    await secrets.clearApiKey()
    expect(localStorage.getItem('coach.apiKey')).toBe(null)
    expect(await secrets.getApiKey()).toBe(null)
  })
})

