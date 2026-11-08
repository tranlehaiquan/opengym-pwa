import { describe, it, expect, vi } from 'vitest';
import { createAiSdkModel, aiSdkAdapter } from './ai-sdk.js';

describe('createAiSdkModel', () => {
  it('instantiates models for gemini, openai, anthropic, and compatible', () => {
    const dummyFetch = vi.fn();
    const gemini = createAiSdkModel('gemini', { key: 'key1', model: 'gemini-1.5-flash', fetch: dummyFetch });
    expect(gemini.modelId).toBe('gemini-1.5-flash');

    const openai = createAiSdkModel('openai', { key: 'key2', model: 'gpt-4o', fetch: dummyFetch });
    expect(openai.modelId).toBe('gpt-4o');

    const anthropic = createAiSdkModel('anthropic', { key: 'key3', model: 'claude-3-5-sonnet', fetch: dummyFetch });
    expect(anthropic.modelId).toBe('claude-3-5-sonnet');

    const compat = createAiSdkModel('compatible', {
      key: 'key4',
      baseUrl: 'http://localhost:11434/v1',
      model: 'llama3',
      fetch: dummyFetch
    });
    expect(compat.modelId).toBe('llama3');
  });

  it('throws on unsupported provider', () => {
    expect(() => createAiSdkModel('unknown-provider', { model: 'm1' })).toThrow(/unsupported provider/);
  });
});

describe('aiSdkAdapter invoke', () => {
  it('returns spawnError when required API key is missing', async () => {
    const adapter = aiSdkAdapter('gemini');
    const res = await adapter.invoke({
      cfg: { provider: 'gemini' },
      env: {},
      prompt: 'hello'
    });
    expect(res.spawnError).toBe(true);
    expect(res.code).toBe(-1);
    expect(res.stderr).toContain('no API key configured');
  });

  it('delegates models listing to fallbackHttpAdapter', async () => {
    const fallback = {
      models: vi.fn().mockResolvedValue({ ok: true, models: ['model-a', 'model-b'] })
    };
    const adapter = aiSdkAdapter('gemini', fallback);
    const res = await adapter.models({}, { GEMINI_API_KEY: 'abc' });
    expect(res.ok).toBe(true);
    expect(res.models).toEqual(['model-a', 'model-b']);
  });
});
