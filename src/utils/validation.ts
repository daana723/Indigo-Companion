// Validation utilities for ADHD AI Companion

import { UserState, Assessment, Question, UserResponse, MoodLevel, EnergyLevel, FocusLevel, StressLevel } from '../models/types.js';

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateUserState(userState: Partial<UserState>): UserState {
  const errors: string[] = [];

  // Validate mood level
  if (!userState.currentMood || !isValidMoodLevel(userState.currentMood)) {
    errors.push('Invalid or missing mood level');
  }

  // Validate energy level
  if (!userState.energyLevel || !isValidEnergyLevel(userState.energyLevel)) {
    errors.push('Invalid or missing energy level');
  }

  // Validate focus capacity
  if (!userState.focusCapacity || !isValidFocusLevel(userState.focusCapacity)) {
    errors.push('Invalid or missing focus capacity');
  }

  // Validate stress level
  if (!userState.stressLevel || !isValidStressLevel(userState.stressLevel)) {
    errors.push('Invalid or missing stress level');
  }

  if (errors.length > 0) {
    throw new ValidationError(`UserState validation failed: ${errors.join(', ')}`);
  }

  return userState as UserState;
}

export function validateAssessment(assessment: Partial<Assessment>): Assessment {
  const errors: string[] = [];

  if (!assessment.id || typeof assessment.id !== 'string') {
    errors.push('Assessment ID is required and must be a string');
  }

  if (!assessment.timestamp || !(assessment.timestamp instanceof Date)) {
    errors.push('Assessment timestamp is required and must be a Date');
  }

  if (!assessment.type || !['daily-checkin', 'mood-assessment', 'focus-evaluation', 'wellness-review'].includes(assessment.type)) {
    errors.push('Invalid assessment type');
  }

  if (!assessment.questions || !Array.isArray(assessment.questions)) {
    errors.push('Assessment questions must be an array');
  }

  if (errors.length > 0) {
    throw new ValidationError(`Assessment validation failed: ${errors.join(', ')}`);
  }

  return assessment as Assessment;
}

export function validateUserResponse(response: Partial<UserResponse>): UserResponse {
  const errors: string[] = [];

  if (!response.questionId || typeof response.questionId !== 'string') {
    errors.push('Question ID is required and must be a string');
  }

  if (response.answer === undefined || response.answer === null) {
    errors.push('Answer is required');
  }

  if (!response.timestamp || !(response.timestamp instanceof Date)) {
    errors.push('Response timestamp is required and must be a Date');
  }

  if (errors.length > 0) {
    throw new ValidationError(`UserResponse validation failed: ${errors.join(', ')}`);
  }

  return response as UserResponse;
}

// Helper validation functions
function isValidMoodLevel(mood: any): mood is MoodLevel {
  return ['very-low', 'low', 'neutral', 'good', 'excellent'].includes(mood);
}

function isValidEnergyLevel(energy: any): energy is EnergyLevel {
  return ['depleted', 'low', 'moderate', 'high', 'energized'].includes(energy);
}

function isValidFocusLevel(focus: any): focus is FocusLevel {
  return ['scattered', 'unfocused', 'moderate', 'focused', 'hyperfocused'].includes(focus);
}

function isValidStressLevel(stress: any): stress is StressLevel {
  return ['calm', 'mild', 'moderate', 'high', 'overwhelming'].includes(stress);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validateTimeRange(minutes: number): boolean {
  return minutes > 0 && minutes <= 120; // Max 2 hours
}

export function validateEffectivenessScore(score: number): boolean {
  return score >= 0 && score <= 10;
}