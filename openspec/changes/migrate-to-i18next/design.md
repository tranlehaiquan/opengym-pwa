# Design

## Context

openGym uses a localization layer split between `frontend/src/lib/i18n-core.js` (pure Node-compatible runtime and translation state) and `frontend/src/lib/i18n.js` (browser-only dynamic bundle loader and React subscription). Over 70 UI components consume `t()`, `tn()`, and `useLang()`. Translation keys are formatted with positional placeholders (`{0}`, `{1}`). Currently, 20 locale files exist as JavaScript ES modules in `frontend/src/locales/*.js` (`export default { ... }`), with Brazilian Portuguese (`pt-BR.js`) inheriting from `pt.js` via JavaScript spreading.

See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Install and configure `i18next` and `react-i18next` in `frontend/package.json`.
- Convert all 20 locale files in `frontend/src/locales/` from `.js` to standard `.json` format (`frontend/src/locales/*.json`).
- Materialize `pt-BR.json` with the complete set of 2,575 keys (merging `pt` base with `PT_BR_OVERRIDES`), while preserving fingerprint validation tooling.
- Update `check-locales.mjs`, `check-source-strings.mjs`, and `watch-strings.mjs` to read and validate `.json` locale dictionaries.
- Initialize an `i18next` core instance in `frontend/src/lib/i18n-core.js` that handles string translations, parameter interpolations, and pluralization.
- Support `{0}`, `{1}` placeholder interpolation natively in the `i18next` configuration so existing translation dictionaries require zero key alterations.
- Expose backward-compatible facade functions `t()`, `tn()`, `setLang()`, `getLang()`, `dateLocale()`, `useLang()` so existing consumers remain completely intact.
- Integrate `i18next.addResourceBundle()` with Vite's `import.meta.glob('../locales/*.json')` lazy chunk loading in `frontend/src/lib/i18n.js`.
- Preserve Swiss German (`de-CH`) string transformation and Arabic (`ar`) RTL document layout.
- Maintain full parity with `frontend/scripts/check-locales.mjs` and existing test suites.

**Non-Goals:**
- Converting all 20 locale dictionaries to ICU message format or changing `{0}` syntax across 50,000+ strings.
- Refactoring every single consumer component from `t()` to `useTranslation()` in one step.
- Altering exercise catalogue metadata build pipelines (`scripts/catalogue/build.mjs`).

## Decisions

### 1. JSON file format conversion
- **Decision**: Convert all `src/locales/*.js` files to `src/locales/*.json`.
- **Rationale**: Aligns openGym with standard translation management systems (Weblate, Crowdin), enables direct loading into i18next backends, and separates pure data from code.
- **Handling `pt-BR`**: In `pt-BR.js`, inheritance was achieved via code (`export default { ...pt, ...PT_BR_OVERRIDES }`). In JSON, `pt-BR.json` will be fully compiled/materialized with all 2,575 keys. A generator/fingerprint script `scripts/pt-br-inheritance-fingerprint.mjs` will verify or synchronize `pt-BR.json` overrides against `pt.json`.

### 2. Interpolation format configuration
- **Decision**: Configure `i18next` with `interpolation: { prefix: '{', suffix: '}' }` or custom format resolver.
- **Rationale**: openGym's 2,575 dictionary keys use `{0}`, `{1}` for parameters. Configuring i18next to recognize `{n}` preserves 100% compatibility with all 20 existing locale files and the strict multiset validation in `check-locales.mjs`.
- **Alternatives Considered**: Mass regex conversion of all 20 files to `{{0}}`. Rejected due to high merge conflict risk, churn, and unnecessary disturbance to translator assets.

### 3. Node vs Browser separation
- **Decision**: Keep `i18next` core instantiation in `i18n-core.js` (Node-safe) and dynamic bundle loading / React hooks in `i18n.js`.
- **Rationale**: Standalone Node scripts, test suites, and MCP servers import `i18n-core.js` directly without Vite or DOM environments. Maintaining this boundary prevents Node import failures.
- **Alternatives Considered**: Merging everything into `i18n.js`. Rejected because non-browser environments cannot execute `import.meta.glob` or React hooks.

### 4. Dynamic resource registration from JSON
- **Decision**: Dynamically load locale modules via Vite's `import.meta.glob('../locales/*.json')` and register them into `i18next` via `i18next.addResourceBundle(lang, 'translation', dict, true, true)`.
- **Rationale**: Preserves on-demand code splitting so initial bundle size remains small and only active languages are fetched over the network.

### 5. Pluralization adapter
- **Decision**: Translate `tn(one, other, n, ...rest)` by either passing `{ count: n }` to i18next or resolving the plural forms via `i18next.t` with category mapping.
- **Rationale**: openGym dictionaries store plurals as nested objects (`{ one: '...', few: '...', many: '...' }`). An adapter allows i18next's CLDR plural engine to resolve these smoothly while keeping existing call sites untouched.

## Risks / Trade-offs

- **[Risk]**: Converting 20 `.js` files to `.json` removes inline code comments.
  - *Mitigation*: Section comments are non-functional; any translator guidance is preserved in project documentation. JSON syntax ensures stricter validation.
- **[Risk]**: Import assertions / attributes in test files (`import de from '../locales/de.json' with { type: 'json' }`).
  - *Mitigation*: Node 22+ and Vite fully support `with { type: 'json' }` and native JSON imports. Update tests to use standard JSON imports or `readFileSync`.
- **[Risk]**: `i18next` bundle size impact.
  - *Mitigation*: `i18next` + `react-i18next` add ~15 kB gzipped, which is negligible for openGym's PWA and mobile packaging.
- **[Risk]**: Positional numeric interpolation (`{0}`, `{1}`) vs named keys (`{count}`).
  - *Mitigation*: Custom interpolation configuration in i18next handles numeric keys passed as an array or object arguments.
