# Spec Delta

## Purpose

Enables multilingual localization across user interface text, exercise catalogues, date formatting, and regional language preferences.

## ADDED Requirements

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

