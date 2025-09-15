// Core data models for ADHD AI Companion

export interface UserState {
  currentMood: MoodLevel;
  energyLevel: EnergyLevel;
  focusCapacity: FocusLevel;
  stressLevel: StressLevel;
  recentChallenges: Challenge[];
  preferences: UserPreferences;
  accessibilityNeeds: AccessibilityNeeds;
}

export interface Assessment {
  id: string;
  timestamp: Date;
  type: AssessmentType;
  questions: Question[];
  responses: UserResponse[];
  summary: PersonalizedSummary;
  recommendedActions: Recommendation[];
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
}

export interface UserResponse {
  questionId: string;
  answer: string | number | string[];
  timestamp: Date;
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  estimatedTime: number;
  difficultyLevel: DifficultyLevel;
  effectiveness: EffectivenessScore;
  personalizedReason: string;
}

export interface UserProgress {
  userId: string;
  assessmentHistory: Assessment[];
  completedRecommendations: CompletedRecommendation[];
  wellnessStreak: number;
  achievements: Achievement[];
  patterns: IdentifiedPattern[];
}

// Enums and supporting types
export type MoodLevel = 'very-low' | 'low' | 'neutral' | 'good' | 'excellent';
export type EnergyLevel = 'depleted' | 'low' | 'moderate' | 'high' | 'energized';
export type FocusLevel = 'scattered' | 'unfocused' | 'moderate' | 'focused' | 'hyperfocused';
export type StressLevel = 'calm' | 'mild' | 'moderate' | 'high' | 'overwhelming';

export type AssessmentType = 'daily-checkin' | 'mood-assessment' | 'focus-evaluation' | 'wellness-review';
export type QuestionType = 'multiple-choice' | 'scale' | 'text' | 'yes-no';
export type RecommendationType = 'focus-technique' | 'wellness-practice' | 'break-suggestion' | 'affirmation';
export type DifficultyLevel = 'easy' | 'moderate' | 'challenging';
export type EffectivenessScore = number; // 0-10 scale

export interface Challenge {
  id: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  category: 'focus' | 'energy' | 'mood' | 'social' | 'executive-function';
}

export interface UserPreferences {
  communicationStyle: 'gentle' | 'direct' | 'encouraging';
  preferredPractices: string[];
  timePreferences: TimePreferences;
  accessibilitySettings: AccessibilitySettings;
}

export interface AccessibilityNeeds {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  voiceInput: boolean;
}

export interface TimePreferences {
  preferredSessionLength: number; // minutes
  reminderFrequency: 'low' | 'moderate' | 'high';
  bestTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'flexible';
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  theme: 'light' | 'dark' | 'high-contrast';
  animations: boolean;
  soundEffects: boolean;
}

export interface PersonalizedSummary {
  overallState: string;
  keyInsights: string[];
  priorityAreas: string[];
  strengths: string[];
}

export interface CompletedRecommendation {
  recommendationId: string;
  completedAt: Date;
  effectiveness: number;
  userFeedback: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: Date;
  category: 'consistency' | 'growth' | 'milestone' | 'wellness';
}

export interface IdentifiedPattern {
  id: string;
  description: string;
  confidence: number;
  suggestions: string[];
  firstObserved: Date;
}