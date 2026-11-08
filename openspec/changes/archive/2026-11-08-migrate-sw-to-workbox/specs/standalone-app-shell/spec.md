# Spec Delta

## MODIFIED Requirements

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
