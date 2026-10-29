# Design

## Context

The openGym frontend features a client-side internationalization system defined in `frontend/src/lib/i18n-core.js` and `frontend/src/lib/i18n.js`. Locale dictionaries are loaded on demand via Vite's `import.meta.glob('../locales/*.js')`.

The project enforces strict locale consistency via `frontend/scripts/check-locales.mjs`: every locale pack must implement all 2,575 translation keys present in the union of existing languages, and must strictly preserve all parameterized placeholders (`{0}`, `{1}`, etc.) of each English source key.

See `proposal.md` and `specs/internationalization/spec.md` for requirements and motivation.

## Goals / Non-Goals

**Goals:**
- Register `vi: 'Tiếng Việt'` in `LANGS` and `'vi-VN'` in `DATE_LOCALES`.
- Produce `frontend/src/locales/vi.js` containing idiomatic fitness translations for all 2,575 application keys, ensuring 100% placeholder compatibility and passing `node frontend/scripts/check-locales.mjs`.
- Add `frontend/src/exercise-names/vi.js` and `frontend/src/instr/vi.js` providing localized naming and execution instructions for standard gym movements.
- Support automatic initial locale detection for devices with `navigator.language` matching `vi*`.
- Verify full integration with Settings language switcher and ensure tests in Vitest pass.

**Non-Goals:**
- Translating user-created custom exercises, personal workout notes, or imported third-party JSON logs.
- Modifying backend server translation infrastructure (openGym operates as a standalone offline client).

## Decisions

### 1. Fitness Domain Terminology for Vietnamese
- **Decision**: Standardize on natural, widely recognized Vietnamese fitness terminology:
  - *Workout* → "Buổi tập"
  - *Routine* → "Lịch tập"
  - *Set* → "Hiệp"
  - *Reps* → "Lần"
  - *Rest* → "Nghỉ"
  - *Warm-up* → "Khởi động"
  - *Drop set* → "Hiệp giảm tạ (Drop set)"
  - *Rest-pause* → "Hiệp nghỉ ngắn (Rest-pause)"
  - *Failure* → "Tới ngưỡng (Failure)"
  - *Bodyweight* → "Cân nặng"
  - *Plate* → "Bánh tạ"
  - *Barbell* → "Thanh đòn"
  - *Dumbbell* → "Tạ đơn"
- **Rationale**: Familiarity with standard Vietnamese gym vernacular ensures immediate usability for both casual gym-goers and serious lifters.

### 2. Validation & Tooling Compliance
- **Decision**: Validate `frontend/src/locales/vi.js` directly against `frontend/scripts/check-locales.mjs` before concluding the apply phase.
- **Rationale**: Any missing key or altered placeholder causes `check-locales.mjs` to exit with an error. Enforcing this in testing guarantees zero translation-related runtime regressions.

### 3. Date and Number Localization
- **Decision**: Map `vi` to `vi-VN` in `DATE_LOCALES`.
- **Rationale**: Standard BCP 47 locale `vi-VN` correctly formats dates in day/month/year order and standard Vietnamese month abbreviations (e.g., "thg 10").

### 4. Catalogue Exercise Names with English Parentheticals
- **Decision**: Follow openGym's standard convention for non-English languages (`enParens: true`), where translated exercise names show the original English name in parentheses (e.g., "Đẩy ngực trên ghế nằm (Bench Press)").
- **Rationale**: In Vietnamese fitness culture, many exercises are frequently referred to by their English names. Showing the English name alongside prevents confusion.

## Risks / Trade-offs

- **[Risk] Missing or malformed `{0}`, `{1}` placeholders**  
  → *Mitigation*: Run `check-locales.mjs` to verify placeholder multiset equality against the English keys.
- **[Risk] File size / bundle bloat from adding 2,575 keys**  
  → *Mitigation*: The `locales/*.js` files are chunked and lazy-loaded on demand by Vite. Adding `vi.js` adds 0 KB to the initial bundle for users on other languages.

## Migration Plan

1. Update `frontend/src/lib/i18n-core.js` to add `vi` to `LANGS` and `DATE_LOCALES`.
2. Generate and verify `frontend/src/locales/vi.js` with all 2,575 keys.
3. Add `frontend/src/exercise-names/vi.js` and `frontend/src/instr/vi.js`.
4. Run `node frontend/scripts/check-locales.mjs` and Vitest test suites.
5. Verify dev build and static bundle generation.

