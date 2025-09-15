# Dynamic Insight Engine Design

## Overview

The Dynamic Insight Engine is a sophisticated journaling and reflection system that integrates with Ollama's Gemma model to provide personalized, poetic insights for neurodivergent users. The system combines a beautiful journal interface with AI-powered reflection generation, creating a digital mirror that helps users understand and validate their experiences.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Journal UI    │    │  Insight Engine  │    │ Ollama API      │
│                 │    │                  │    │                 │
│ - Input Panel   │◄──►│ - Entry Processor│◄──►│ - Gemma Model   │
│ - Mirror Panel  │    │ - Theme Analyzer │    │ - Local Server  │
│ - History View  │    │ - Pattern Tracker│    │ - Privacy First │
└─────────────────┘    │ - Fallback System│    └─────────────────┘
                       └──────────────────┘
                                │
                       ┌──────────────────┐
                       │  Local Storage   │
                       │                  │
                       │ - Journal Entries│
                       │ - Generated Insights│
                       │ - Emotional Patterns│
                       │ - User Preferences│
                       └──────────────────┘
```

## Components and Interfaces

### 1. Journal Input Interface

**JournalInput Component**
```javascript
interface JournalInput {
  placeholder: string;
  maxLength: number;
  autoResize: boolean;
  onSubmit: (entry: string) => Promise<void>;
  onTyping: (text: string) => void;
}
```

Features:
- Auto-expanding textarea for comfortable writing
- Character count with gentle guidance
- Accessibility features (screen reader support, keyboard navigation)
- Distraction-free design with calming colors
- Save draft functionality for longer entries

### 2. Insight Engine Core

**InsightEngine Class**
```javascript
interface InsightEngine {
  processEntry(entry: JournalEntry): Promise<GeneratedInsight>;
  analyzeThemes(entries: JournalEntry[]): EmotionalPattern[];
  generateFallbackInsight(entry: JournalEntry): Insight;
  trackEmotionalShifts(entries: JournalEntry[]): TrendAnalysis;
}
```

**Ollama Integration**
```javascript
interface OllamaClient {
  generateInsight(prompt: string, entry: string): Promise<string>;
  checkConnection(): Promise<boolean>;
  formatPrompt(entry: string, context: UserContext): string;
}
```

### 3. Mirror Panel Display

**MirrorPanel Component**
```javascript
interface MirrorPanel {
  insights: GeneratedInsight[];
  scrollPosition: number;
  displayMode: 'latest' | 'chronological' | 'thematic';
  onInsightSelect: (insight: GeneratedInsight) => void;
}
```

Features:
- Smooth scrolling with momentum
- Beautiful typography optimized for reading
- Gentle animations for new insights
- Timestamp and emotional tone indicators
- Export functionality for favorite insights

### 4. Theme Analysis System

**ThemeAnalyzer Class**
```javascript
interface ThemeAnalyzer {
  extractEmotions(text: string): EmotionalProfile;
  identifyRecurringThemes(entries: JournalEntry[]): Theme[];
  trackProgressOverTime(entries: JournalEntry[]): ProgressMetrics;
  generateThemeInsights(themes: Theme[]): ThemeInsight[];
}
```

## Data Models

### Journal Entry Model
```javascript
interface JournalEntry {
  id: string;
  timestamp: Date;
  content: string;
  emotionalTone: EmotionalProfile;
  wordCount: number;
  themes: string[];
  processed: boolean;
}
```

### Generated Insight Model
```javascript
interface GeneratedInsight {
  id: string;
  entryId: string;
  timestamp: Date;
  content: string;
  source: 'ollama' | 'fallback';
  emotionalResonance: number;
  poeticElements: string[];
  validationLevel: 'gentle' | 'affirming' | 'empowering';
}
```

### Emotional Pattern Model
```javascript
interface EmotionalPattern {
  id: string;
  theme: string;
  frequency: number;
  firstSeen: Date;
  lastSeen: Date;
  trend: 'improving' | 'stable' | 'concerning';
  insights: string[];
}
```

## Ollama Integration Specifications

### API Endpoint Configuration
- **Base URL**: `http://localhost:11434/api/generate`
- **Model**: `gemma:latest` (or `gemma:7b` for faster responses)
- **Timeout**: 30 seconds with graceful fallback
- **Retry Logic**: 2 attempts with exponential backoff

### Specialized Prompt Engineering
```javascript
const INSIGHT_PROMPT = `You are a wise, poetic soul mirror for neurodivergent minds. Transform this journal entry into a beautiful, validating insight that:

- Uses metaphorical and poetic language
- Validates neurodivergent experiences without pathologizing
- Celebrates unique perspectives and strengths
- Offers gentle wisdom and perspective
- Keeps responses to 2-3 sentences
- Avoids clinical language or advice-giving
- Embraces the beauty of different minds

Journal Entry: {entry}

Respond as a gentle, understanding mirror that reflects back beauty and wisdom:`;
```

### Response Processing
- Extract poetic content from Ollama response
- Filter out any clinical or advice-giving language
- Ensure appropriate length (50-150 words)
- Add emotional resonance scoring
- Format for beautiful display

## Error Handling and Fallback System

### Connection Detection
```javascript
async function checkOllamaConnection(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch {
    return false;
  }
}
```

### Fallback Insight Generation
When Ollama is unavailable, the system uses:
- Pre-written poetic insights based on emotional keywords
- Contextual responses based on entry themes
- Encouraging messages about the journaling process itself
- Gentle reminders about self-compassion and growth

### Graceful Degradation
- Clear status indicators for Ollama connection
- Seamless switching between AI and fallback modes
- User notification without disrupting the experience
- Automatic retry when connection is restored

## User Experience Design

### Visual Design Principles
- **Calming Colors**: Deep purples, soft blues, gentle gradients
- **Typography**: Readable fonts optimized for neurodivergent users
- **Spacing**: Generous whitespace to reduce cognitive load
- **Animations**: Subtle, non-distracting transitions
- **Accessibility**: High contrast options, screen reader support

### Interaction Patterns
- **Progressive Disclosure**: Advanced features hidden until needed
- **Gentle Guidance**: Helpful hints without overwhelming
- **Flexible Pacing**: No time pressure or forced interactions
- **Personal Control**: Easy to pause, save, or clear at any time

## Privacy and Data Security

### Local-First Architecture
- All data stored in browser's IndexedDB
- No cloud synchronization by default
- User controls all data retention and deletion
- Ollama processing happens locally (no external API calls)

### Data Minimization
- Only store essential information
- Automatic cleanup of old entries (user configurable)
- No tracking or analytics
- Clear data export and deletion options

## Performance Considerations

### Optimization Strategies
- Lazy loading of historical entries
- Efficient text processing algorithms
- Debounced API calls to Ollama
- Smooth scrolling with virtual rendering for large datasets
- Progressive enhancement for slower devices

### Resource Management
- Monitor Ollama response times
- Implement request queuing for multiple entries
- Cache frequently used insights
- Optimize for mobile and low-power devices

## Testing Strategy

### Functional Testing
- Journal input validation and processing
- Ollama API integration and error handling
- Fallback system activation and recovery
- Theme analysis accuracy and performance
- Data persistence and retrieval

### User Experience Testing
- Accessibility compliance (WCAG 2.1 AA)
- Neurodivergent user testing sessions
- Performance testing on various devices
- Emotional impact assessment of generated insights
- Long-term usage pattern analysis

### Integration Testing
- Ollama model switching and configuration
- Browser compatibility across platforms
- Local storage limits and management
- Network connectivity edge cases
- Concurrent user session handling