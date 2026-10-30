/* Adapter layer backed by the unified Vercel AI SDK (ai).
 *
 * Provides a standardized bridge across Google Gemini, OpenAI, Anthropic,
 * and OpenAI-compatible endpoints with custom fetch support (nativeFetch on mobile,
 * browser window.fetch on web/PWA).
 */
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { HTTP_PROVIDERS, baseUrlFor, extraHeadersFor } from '../providers.js';
import { SYSTEM_PROMPT } from '../system-prompt.js';

export function normalizeBaseUrl(providerId, rawBase) {
  if (!rawBase) {
    if (providerId === 'openai') return 'https://api.openai.com/v1';
    return undefined;
  }
  const base = String(rawBase).replace(/\/+$/, '');
  if ((providerId === 'openai' || providerId === 'compatible') && !/\/v\d+/i.test(base) && !base.endsWith('/v1')) {
    // If it's a bare host like https://api.openai.com, append /v1
    if (/^https?:\/\/[^/]+$/i.test(base)) return base + '/v1';
  }
  return base;
}

/**
 * @param {string} providerId
 * @param {{ key?: string, baseUrl?: string, headers?: Record<string, string>, fetch?: typeof fetch, model: string }} options
 * @returns {any}
 */
export function createAiSdkModel(providerId, { key, baseUrl, headers = {}, fetch: fetchImpl, model }) {
  const normalizedBase = normalizeBaseUrl(providerId, baseUrl);
  if (providerId === 'gemini') {
    const google = createGoogleGenerativeAI({
      apiKey: key,
      fetch: fetchImpl,
      baseURL: normalizedBase
    });
    return google(model);
  }
  if (providerId === 'openai') {
    const openai = createOpenAI({
      apiKey: key,
      fetch: fetchImpl,
      baseURL: normalizedBase
    });
    return typeof openai.chat === 'function' ? openai.chat(model) : openai(model);
  }
  if (providerId === 'anthropic') {
    const anthropic = createAnthropic({
      apiKey: key,
      fetch: fetchImpl,
      baseURL: normalizedBase,
      headers: {
        'anthropic-dangerous-direct-browser-access': 'true',
        ...headers
      }
    });
    return anthropic(model);
  }
  if (providerId === 'compatible') {
    const compat = createOpenAI({
      apiKey: key || 'dummy',
      baseURL: normalizedBase,
      headers,
      fetch: fetchImpl
    });
    return typeof compat.chat === 'function' ? compat.chat(model) : compat(model);
  }
  throw new Error(`unsupported provider for AI SDK: ${providerId}`);
}

export function aiSdkAdapter(providerId, fallbackHttpAdapter) {
  const meta = HTTP_PROVIDERS[providerId] || {};

  return {
    id: providerId,
    spawns: false,
    baseUrl(cfg) {
      return baseUrlFor(providerId, cfg);
    },
    async invoke(opts = {}) {
      if (fallbackHttpAdapter && typeof fallbackHttpAdapter.invoke === 'function' && !opts.useAiSdkDirectly) {
        return fallbackHttpAdapter.invoke(opts);
      }

      const { cfg, prompt, system, env, model, fetch: fetchImpl = globalThis.fetch, signal, maxTokens = 16000 } = opts;
      const base = baseUrlFor(providerId, cfg);
      const key = env && env[meta.apiKeyEnv];

      if (!base && !meta.defaultBase) {
        return { code: -1, text: '', stderr: `no endpoint configured for ${providerId}`, spawnError: true };
      }
      if (!key && !meta.keyOptional) {
        return { code: -1, text: '', stderr: `no API key configured for ${providerId}`, spawnError: true };
      }

      const chosenModel = model || meta.defaultModel;
      if (!chosenModel) {
        return { code: 1, text: '', stderr: `no model chosen for ${providerId}` };
      }

      const extraHeaders = extraHeadersFor(providerId, cfg);

      try {
        const modelInstance = createAiSdkModel(providerId, {
          key,
          baseUrl: base || undefined,
          headers: extraHeaders,
          fetch: fetchImpl,
          model: chosenModel
        });

        const fullSystem = system ? SYSTEM_PROMPT + '\n\n' + system : SYSTEM_PROMPT;

        const result = await generateText({
          model: modelInstance,
          system: fullSystem,
          prompt,
          maxTokens,
          abortSignal: signal
        });

        return { code: 0, text: String(result.text || '').trim(), stderr: '' };
      } catch (err) {
        if (err.name === 'AbortError' || signal?.aborted) {
          return { code: -1, text: '', stderr: 'timed out', timedOut: true };
        }
        const msg = String(err.message || err);
        const isAuth = err.statusCode === 401 || err.statusCode === 403 || /401|403|unauthorized|invalid api key|forbidden|api_key/i.test(msg);
        const prefix = err.statusCode ? `${err.statusCode} ` : (isAuth ? '401 ' : '');
        return { code: 1, text: '', stderr: `${prefix}${msg}` };
      }
    },
    async models(cfg, env, opts = {}) {
      if (fallbackHttpAdapter && typeof fallbackHttpAdapter.models === 'function') {
        return fallbackHttpAdapter.models(cfg, env, opts);
      }
      return { ok: false, error: 'model listing not supported', models: [] };
    },
    async check(cfg, env, opts = {}) {
      if (fallbackHttpAdapter && typeof fallbackHttpAdapter.check === 'function') {
        return fallbackHttpAdapter.check(cfg, env, opts);
      }
      return { ok: false, error: 'check not supported' };
    }
  };
}
