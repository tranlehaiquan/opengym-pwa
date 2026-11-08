# Spec Delta

## ADDED Requirements

### Requirement: Consistent proposal resolution without duplicate rendering
The system SHALL ensure that resolving an ephemeral AI Coach proposal (such as a workout debrief, created plan, or workout review) clears the pending proposal card from active UI display immediately and does not dual-render the interactive proposal card alongside its durable conversation thread entry.

#### Scenario: Acknowledging a workout debrief
- **WHEN** a user clicks "Got it" to acknowledge a completed workout debrief proposal
- **THEN** the debrief recap entry is recorded in the conversation thread, the pending debrief proposal card is immediately dismissed, and subsequent polling does not re-render the debrief proposal card

#### Scenario: Importing a generated plan
- **WHEN** a user accepts and imports a generated workout plan proposal
- **THEN** the imported plan recap entry is recorded in the conversation thread, the pending plan proposal card is immediately dismissed, and subsequent polling does not re-render the plan proposal card

#### Scenario: Discarding a proposal
- **WHEN** a user discards a generated plan or suggestion review
- **THEN** the dismissal is logged in the conversation thread, the pending proposal card is immediately dismissed, and subsequent polling does not re-render the proposal card
