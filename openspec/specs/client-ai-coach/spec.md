# client-ai-coach Specification

## Purpose

Enables workout coaching intelligence directly within client web and standalone PWA environments by configuring LLM providers, persisting API keys in client storage, and executing requests in-browser.

## Requirements

### Requirement: Client-side LLM provider configuration
The system SHALL allow users to configure LLM providers (Anthropic, OpenAI, Google Gemini, and OpenAI-compatible endpoints), specify custom base URLs and request headers where supported, and choose models directly in the client settings interface.

#### Scenario: Selecting a cloud LLM provider
- **WHEN** a user selects a provider like Google Gemini, Anthropic, or OpenAI in the Coach setup screen
- **THEN** the system updates the active provider configuration and prepares client requests using that provider's API structure

#### Scenario: Configuring a local or custom endpoint
- **WHEN** a user selects an OpenAI-compatible provider and provides a custom base URL
- **THEN** the system validates the URL format and routes chat completion calls to that custom address

### Requirement: Secure client-side API key persistence
The system SHALL persist the user's API key in durable client storage across page reloads and application restarts, while strictly isolating the credential from application state backups and sync payloads.

#### Scenario: Storing API key on web or PWA
- **WHEN** a user enters and saves their API key in the client Coach setup interface
- **THEN** the system saves the key in persistent client storage and reflects the key as saved without exposing the raw key in plaintext UI

#### Scenario: Removing API key
- **WHEN** a user chooses to forget or clear their API key
- **THEN** the system purges the stored key from client storage and marks Coach as unconfigured

#### Scenario: Backup isolation
- **WHEN** a user exports an application backup JSON
- **THEN** the exported data does not contain the stored API key

### Requirement: Direct client LLM request execution
The system SHALL execute model discovery, plan generation, and workout review requests directly from the client browser runtime via HTTP fetch without proxying through a backend server.

#### Scenario: Listing available models
- **WHEN** a user tests their connection or opens the model picker in Coach setup
- **THEN** the system queries the provider endpoint from the client and populates the model choices

#### Scenario: Generating coach plans and reviews
- **WHEN** a user submits an intake questionnaire or requests a workout review
- **THEN** the system constructs the prompt payload, transmits it directly to the provider endpoint with the client's API key, and validates the response

#### Scenario: Provider request failure
- **WHEN** a provider request fails due to network disconnection or invalid credentials
- **THEN** the system catches the failure and displays a human-readable error toast or notification in the client interface

### Requirement: Client data consent transparency
The system SHALL present a data consent agreement prior to making any external LLM calls, clearly detailing what workout, bodyweight, and profile data will be transmitted to the configured provider.

#### Scenario: Prompting for consent before first request
- **WHEN** a user enables the Coach or initiates their first AI review without prior consent
- **THEN** the system displays the data disclosure sheet and halts execution until the user explicitly agrees

