# standalone-app-shell Specification

## Purpose

Enables the workout tracker to boot directly into the local user experience as a Progressive Web App operating 100% offline without remote authentication or backend services.

## Requirements

### Requirement: Direct local boot without authentication
The system SHALL boot directly into the user interface on startup without prompting for credentials, server URLs, or displaying login screens.

#### Scenario: App launch
- **WHEN** a user opens the application URL in a browser or as an installed PWA
- **THEN** the system bypasses all login screens and immediately displays the main workout tracker interface

### Requirement: Fully offline PWA caching
The system SHALL install a service worker that precaches all application scripts, stylesheets, exercise catalogue data, and static media to guarantee functional offline operation.

#### Scenario: Offline navigation
- **WHEN** a user opens the app or interacts with exercise views while device network connectivity is disabled
- **THEN** all user interface elements, timers, charts, and catalogue illustrations render without network errors

### Requirement: Standalone Settings interface
The system SHALL display only client-relevant controls in Settings, excluding server sync status, remote server pairing, user management, and passkey registration.

#### Scenario: Viewing settings
- **WHEN** a user opens the Settings view in the standalone PWA
- **THEN** the system displays local preferences, units, appearance, and backup/restore controls while hiding all server-related sections

