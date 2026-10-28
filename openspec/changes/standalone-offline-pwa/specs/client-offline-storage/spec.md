# Spec Delta

## Purpose

Provides durable client-side storage for workout routines, logs, bodyweight history, and media without requiring an external server or database.

## ADDED Requirements

### Requirement: Local state persistence
The system SHALL persist the complete application state (routines, history, weighins, and preferences) in browser storage so that user progress survives reloads and browser restarts without internet access.

#### Scenario: App reload with existing data
- **WHEN** a user logs workouts and refreshes or restarts the browser offline
- **THEN** the system loads the saved state from client storage with all history and settings intact

#### Scenario: Fresh launch initialization
- **WHEN** a user opens the application for the very first time with no stored state
- **THEN** the system initializes default starter routines and settings in client storage

### Requirement: Custom media persistence
The system SHALL store custom exercise photos, animations, and videos directly in browser IndexedDB without sending files to any remote server.

#### Scenario: Storing custom exercise media
- **WHEN** a user attaches a photo or video to a custom exercise offline
- **THEN** the system stores the file Blob into IndexedDB and generates a local object URL for display

### Requirement: Portable file backup and restore
The system SHALL enable users to export their entire workout data, history, and configuration as a downloadable JSON file and import previously exported backup files.

#### Scenario: Exporting backup
- **WHEN** a user requests a backup in Settings
- **THEN** the system triggers a browser file download containing the full JSON snapshot of user data

#### Scenario: Restoring backup
- **WHEN** a user selects a valid openGym backup JSON file to import
- **THEN** the system parses the file, restores the state into client storage, and refreshes the application view immediately

