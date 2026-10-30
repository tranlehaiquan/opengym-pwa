# Spec Delta

## Purpose

Standardizes the frontend localization runtime on an i18next engine that provides dynamic string translation, CLDR-compliant pluralization, lazy locale loading from standard JSON resources, and backward-compatible React helpers.

## ADDED Requirements

### Requirement: i18next runtime translation and interpolation
The system SHALL execute application UI translations and dynamic parameter interpolations through an initialized i18next engine while falling back to English when a key or language pack is missing.

#### Scenario: Dynamic translation lookup with arguments
- **WHEN** a component or helper requests translation of a key with parameter arguments
- **THEN** the system formats the string with substituted parameters according to the active language dictionary

#### Scenario: Missing key fallback
- **WHEN** a translation key is not present in the active language dictionary
- **THEN** the system returns the original key or English fallback without throwing runtime errors

### Requirement: JSON translation resource format
The system SHALL store and maintain translation dictionaries as valid JSON files in the frontend locales directory, ensuring full key and placeholder parity across all supported languages.

#### Scenario: Loading translations from JSON dictionaries
- **WHEN** the system imports or fetches a language dictionary
- **THEN** it parses the corresponding JSON resource file and registers the translation keys into the translation engine

#### Scenario: Translation validation tooling
- **WHEN** running locale validation tooling (`check-locales.mjs`)
- **THEN** all JSON locale files are validated for key parity, non-empty values, and placeholder integrity

### Requirement: On-demand locale pack loading
The system SHALL code-split language packs and asynchronously load only the requested language dictionary upon user selection or initial locale detection.

#### Scenario: Lazy chunk fetch upon language switch
- **WHEN** the user switches the active interface language to another supported language
- **THEN** the application fetches that specific language pack on-demand without reloading the page or downloading all bundles upfront

### Requirement: Backward-compatible translation facade
The system SHALL provide backward-compatible `t()`, `tn()`, `setLang()`, `getLang()`, `dateLocale()`, and reactive subscription hooks so existing UI components continue functioning without code changes.

#### Scenario: Component rendering via legacy t and tn helpers
- **WHEN** an existing component invokes `t(key, ...args)` or `tn(one, other, n, ...args)`
- **THEN** the system translates the text and resolves correct singular/plural forms matching platform plural rules

#### Scenario: Reactive component updates on language change
- **WHEN** the active language is updated via `setLang`
- **THEN** all subscribed components re-render with the new language strings immediately

### Requirement: Regional dialect and RTL text direction support
The system SHALL support derived dialects by applying orthographic transforms and configure HTML document direction for right-to-left languages.

#### Scenario: Swiss German dialect transformation
- **WHEN** the user selects Swiss German (`de-CH`)
- **THEN** the system derives the dictionary from German (`de`) by replacing `ß` with `ss`

#### Scenario: Right-to-left layout for Arabic
- **WHEN** the user selects Arabic (`ar`)
- **THEN** the system sets document direction to `rtl` and isolates bilingual parenthetical names
