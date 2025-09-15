// Service interfaces for ADHD AI Companion

import { 
  Assessment, 
  AssessmentType, 
  UserResponse, 
  UserState, 
  PersonalizedSummary,
  Recommendation,
  Question,
  UserPreferences,
  AccessibilityNeeds,
  Achievement,
  IdentifiedPattern,
  CompletedRecommendation
} from '../models/types.js';

export interface AssessmentEngine {
  initiateAssessment(type: AssessmentType): Assessment;
  processResponse(response: UserResponse): AssessmentState;
  generateSummary(assessment: Assessment): PersonalizedSummary;
  identifyPatterns(history: Assessment[]): IdentifiedPattern[];
}

export interface RecommendationEngine {
  generateRecommendations(userState: UserState): Recommendation[];
  adaptToFeedback(recommendation: Recommendation, feedback: Feedback): void;
  prioritizeByUrgency(recommendations: Recommendation[]): Recommendation[];
  trackEffectiveness(recommendation: Recommendation, outcome: Outcome): void;
}

export interface AffirmationSystem {
  generatePersonalizedAffirmation(userState: UserState): Affirmation;
  celebrateAchievement(achievement: Achievement): Celebration;
  provideComfort(distressLevel: DistressLevel): ComfortMessage;
  adaptTone(userPreferences: UserPreferences): void;
}

export interface WellnessPractices {
  suggestPractices(userState: UserState, timeAvailable: number): Practice[];
  guidePractice(practice: Practice): PracticeSession;
  trackParticipation(session: PracticeSession): void;
  modifyForAccessibility(practice: Practice, needs: AccessibilityNeeds): Practice;
}

export interface QuestionEngine {
  generateContextualQuestions(userState: UserState): Question[];
  adaptQuestioningStyle(userResponses: UserResponse[]): QuestioningStyle;
  detectOverwhelm(userBehavior: UserBehavior): boolean;
  simplifyApproach(currentQuestions: Question[]): Question[];
}

export interface LocalStorageManager {
  storeUserData(userId: string, data: any): Promise<void>;
  retrieveUserData(userId: string): Promise<any>;
  exportUserData(userId: string): Promise<string>;
  deleteUserData(userId: string): Promise<void>;
  encryptSensitiveData(data: any): string;
  decryptSensitiveData(encryptedData: string): any;
}

// Supporting types for interfaces
export interface AssessmentState {
  currentQuestion: number;
  totalQuestions: number;
  responses: UserResponse[];
  isComplete: boolean;
}

export interface Feedback {
  rating: number;
  comment: string;
  helpful: boolean;
  timestamp: Date;
}

export interface Outcome {
  completed: boolean;
  effectiveness: number;
  timeSpent: number;
  userSatisfaction: number;
}

export interface Affirmation {
  text: string;
  category: 'self-compassion' | 'strength' | 'progress' | 'acceptance';
  personalizedElements: string[];
}

export interface Celebration {
  message: string;
  visualEffect: string;
  soundEffect?: string;
  badge?: Achievement;
}

export interface ComfortMessage {
  text: string;
  tone: 'gentle' | 'understanding' | 'encouraging';
  followUpSuggestions: string[];
}

export type DistressLevel = 'mild' | 'moderate' | 'high' | 'crisis';

export interface Practice {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  category: 'breathing' | 'movement' | 'mindfulness' | 'grounding' | 'energy';
  instructions: string[];
  accessibilityModifications: AccessibilityModification[];
}

export interface PracticeSession {
  practiceId: string;
  startTime: Date;
  duration: number;
  completed: boolean;
  userFeedback?: Feedback;
}

export interface AccessibilityModification {
  type: 'visual' | 'auditory' | 'motor' | 'cognitive';
  description: string;
  alternativeInstructions: string[];
}

export interface QuestioningStyle {
  pace: 'slow' | 'moderate' | 'quick';
  complexity: 'simple' | 'moderate' | 'detailed';
  supportLevel: 'minimal' | 'moderate' | 'high';
}

export interface UserBehavior {
  responseTime: number[];
  skipRate: number;
  engagementLevel: number;
  stressIndicators: string[];
}