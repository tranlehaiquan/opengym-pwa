# internationalization Specification

## Purpose

Enables multilingual localization across user interface text, exercise catalogues, date formatting, and regional language preferences, standardizing the frontend localization runtime on an i18next engine.

## Requirements

### Requirement: Vietnamese language availability
The system SHALL provide Vietnamese ("Tiếng Việt") as a selectable language option and detect it automatically on first launch when device settings indicate Vietnamese.

#### Scenario: Selecting Vietnamese in settings
- **WHEN** a user selects "Tiếng Việt" in the Settings language picker
- **THEN** the application immediately switches the active language to Vietnamese and stores the preference in offline storage

#### Scenario: Automatic detection on first launch
- **WHEN** a user opens the application for the first time on a browser whose language begins with `vi`
- **THEN** the system sets the default initial language to Vietnamese

### Requirement: Vietnamese UI string localization
The system SHALL translate all application interface strings into Vietnamese with complete placeholder parity for dynamic values.

#### Scenario: Translating UI text
- **WHEN** the application renders screens, sheets, buttons, timers, or prompts while Vietnamese is active
- **THEN** all user-visible text is rendered in Vietnamese using the local dictionary

#### Scenario: Parameterized placeholder substitution
- **WHEN** the system formats strings containing dynamic arguments (such as set counts, weight values, or elapsed duration)
- **THEN** the system substitutes numeric and text arguments into the corresponding indexed placeholders without syntax errors

### Requirement: Localized regional date and exercise metadata
The system SHALL format dates using Vietnamese conventions and provide localized exercise names and instructions with English fallback support.

#### Scenario: Vietnamese date formatting
- **WHEN** displaying dates on workout logs, history entries, or calendar views in Vietnamese
- **THEN** dates are formatted according to the `vi-VN` locale convention

#### Scenario: Localized exercise naming and instruction display
- **WHEN** a user views catalogue exercises or routine details in Vietnamese
- **THEN** the system displays Vietnamese exercise names and instructions, showing the English original in parentheses when enabled

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

