# Dynamic Insight Engine Requirements

## Introduction

This feature extends the Indigo Soul Companion with a dynamic insight engine that uses Ollama (Gemma model) to transform user journal entries into poetic, emotionally validating insights specifically crafted for neurodivergent users. The system provides a reflective mirror panel that helps users process their experiences through AI-generated wisdom.

## Requirements

### Requirement 1

**User Story:** As a neurodivergent user, I want to input my thoughts and feelings into a journal interface, so that I can express myself freely and receive personalized insights.

#### Acceptance Criteria

1. WHEN the user accesses the insight engine THEN the system SHALL display a clean, accessible journal input interface
2. WHEN the user types in the journal input THEN the system SHALL provide a comfortable, distraction-free writing experience
3. WHEN the user submits their journal entry THEN the system SHALL validate the input and prepare it for processing
4. IF the journal entry is empty THEN the system SHALL prompt the user with gentle encouragement to share their thoughts

### Requirement 2

**User Story:** As a user, I want my journal entries processed by a local AI model, so that my personal thoughts remain private while receiving meaningful insights.

#### Acceptance Criteria

1. WHEN a journal entry is submitted THEN the system SHALL send a request to http://localhost:11434/api/generate
2. WHEN making the API request THEN the system SHALL use the Gemma model for processing
3. WHEN sending the request THEN the system SHALL include a specialized prompt for neurodivergent-focused, poetic insights
4. WHEN the API responds THEN the system SHALL extract and format the generated insight appropriately

### Requirement 3

**User Story:** As a neurodivergent user, I want to receive poetic, emotionally validating insights, so that I feel understood and supported in my unique experiences.

#### Acceptance Criteria

1. WHEN generating insights THEN the system SHALL create responses that are poetic and metaphorically rich
2. WHEN crafting insights THEN the system SHALL validate neurodivergent experiences without pathologizing them
3. WHEN providing insights THEN the system SHALL use affirming language that celebrates neurodivergent strengths
4. WHEN responding to difficult emotions THEN the system SHALL offer gentle wisdom and perspective without dismissing feelings

### Requirement 4

**User Story:** As a user, I want insights displayed in a beautiful, scrollable mirror panel, so that I can reflect on multiple insights and revisit them easily.

#### Acceptance Criteria

1. WHEN an insight is generated THEN the system SHALL display it in a visually appealing mirror panel
2. WHEN multiple insights exist THEN the system SHALL make the panel scrollable to view all insights
3. WHEN displaying insights THEN the system SHALL include timestamps and visual separation between entries
4. WHEN the panel is full THEN the system SHALL maintain smooth scrolling performance and readability

### Requirement 5

**User Story:** As a user, I want the system to work even when Ollama is offline, so that I can still use the companion without technical barriers.

#### Acceptance Criteria

1. WHEN Ollama is not running THEN the system SHALL detect the connection failure gracefully
2. WHEN the API is unavailable THEN the system SHALL display a meaningful fallback message
3. WHEN in fallback mode THEN the system SHALL still provide supportive, pre-written insights
4. WHEN Ollama comes back online THEN the system SHALL automatically resume normal operation

### Requirement 6

**User Story:** As a user interested in personal growth, I want the system to track recurring themes and emotional shifts over time, so that I can understand my patterns and progress.

#### Acceptance Criteria

1. WHEN processing journal entries THEN the system SHALL analyze and store emotional themes and keywords
2. WHEN multiple entries exist THEN the system SHALL identify recurring patterns and emotional trends
3. WHEN significant patterns emerge THEN the system SHALL optionally highlight these insights to the user
4. WHEN displaying patterns THEN the system SHALL present them in an encouraging, growth-oriented manner
5. WHEN storing pattern data THEN the system SHALL maintain user privacy and allow data deletion

### Requirement 7

**User Story:** As a user, I want my journal data and insights stored locally, so that my personal reflections remain private and accessible offline.

#### Acceptance Criteria

1. WHEN journal entries are created THEN the system SHALL store them locally in the browser
2. WHEN insights are generated THEN the system SHALL save them alongside the original entries
3. WHEN the user returns to the application THEN the system SHALL load previous entries and insights
4. WHEN the user wants to clear data THEN the system SHALL provide options to delete entries while maintaining privacy