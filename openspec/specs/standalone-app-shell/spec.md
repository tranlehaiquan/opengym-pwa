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
The system SHALL install a service worker built with Google Workbox that precaches core application bundles and enforces runtime caching strategies—including network-first for navigations, cache-first for hashed assets, cache-first with LRU expiration for media, and HTTP range request handling for video playback—guaranteeing complete offline functionality.

#### Scenario: Offline navigation
- **WHEN** a user opens the app or interacts with exercise views while device network connectivity is disabled
- **THEN** all user interface elements, timers, charts, and catalogue illustrations render without network errors

#### Scenario: Offline video clip playback
- **WHEN** a user views an exercise demonstration video while device network connectivity is disabled
- **THEN** the service worker answers HTTP byte-range requests from the media cache, enabling video streaming and scrubbing without a network connection

#### Scenario: Cache expiration and bounded storage
- **WHEN** cached exercise media exceeds storage bounds or maximum item thresholds
- **THEN** the service worker's cache expiration policy evicts the least recently used media entries while keeping precached application shell assets intact

### Requirement: Standalone Settings interface
The system SHALL display client-relevant controls in Settings—including local preferences, units, appearance, backup/restore, and AI Coach configuration—while excluding server sync status, remote server pairing, user management, and passkey registration.

#### Scenario: Viewing settings
- **WHEN** a user opens the Settings view in the standalone PWA
- **THEN** the system displays local preferences, units, appearance, AI Coach setup, and backup/restore controls while hiding all server-related sections
