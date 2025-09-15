// Unit tests for data models

import { UserStateModel } from '../models/UserState.js';
import { AssessmentModel } from '../models/Assessment.js';
import { QuestionModel } from '../models/Question.js';
import { UserResponseModel } from '../models/UserResponse.js';

// UserState Model Tests
describe('UserStateModel', () => {
  test('should create with default values', () => {
    const userState = new UserStateModel();
    
    expect(userState.currentMood).toBe('neutral');
    expect(userState.energyLevel).toBe('moderate');
    expect(userState.focusCapacity).toBe('moderate');
    expect(userState.stressLevel).toBe('mild');
    expect(userState.recentChallenges).toEqual([]);
  });

  test('should validate mood levels correctly', () => {
    expect(UserStateModel.isValidMoodLevel('excellent')).toBe(true);
    expect(UserStateModel.isValidMoodLevel('invalid')).toBe(false);
  });

  test('should calculate overall wellbeing', () => {
    const userState = new UserStateModel({
      currentMood: 'good',
      energyLevel: 'high',
      focusCapacity: 'focused',
      stressLevel: 'mild'
    });
    
    const wellbeing = userState.getOverallWellbeing();
    expect(wellbeing).toBeGreaterThan(3);
  });

  test('should detect when support is needed', () => {
    const strugglingUser = new UserStateModel({
      currentMood: 'very-low',
      stressLevel: 'overwhelming'
    });
    
    expect(strugglingUser.needsSupport()).toBe(true);
  });

  test('should validate user state data', () => {
    const userState = new UserStateModel({
      currentMood: 'invalid' as any
    });
    
    const validation = userState.validate();
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('Invalid mood level');
  });
});

// Assessment Model Tests
describe('AssessmentModel', () => {
  test('should create with generated ID and timestamp', () => {
    const assessment = new AssessmentModel();
    
    expect(assessment.id).toBeTruthy();
    expect(assessment.timestamp).toBeInstanceOf(Date);
    expect(assessment.type).toBe('daily-checkin');
  });

  test('should validate assessment type', () => {
    expect(AssessmentModel.isValidAssessmentType('mood-assessment')).toBe(true);
    expect(AssessmentModel.isValidAssessmentType('invalid')).toBe(false);
  });

  test('should track progress correctly', () => {
    const assessment = new AssessmentModel();
    assessment.questions = [
      { id: '1', text: 'Q1', type: 'text', required: true },
      { id: '2', text: 'Q2', type: 'text', required: true }
    ];
    assessment.responses = [
      { questionId: '1', answer: 'Answer 1', timestamp: new Date() }
    ];
    
    const progress = assessment.getProgress();
    expect(progress.completed).toBe(1);
    expect(progress.total).toBe(2);
    expect(progress.percentage).toBe(50);
  });

  test('should detect completion status', () => {
    const assessment = new AssessmentModel();
    assessment.questions = [
      { id: '1', text: 'Q1', type: 'text', required: true },
      { id: '2', text: 'Q2', type: 'text', required: false }
    ];
    assessment.responses = [
      { questionId: '1', answer: 'Answer 1', timestamp: new Date() }
    ];
    
    expect(assessment.isComplete()).toBe(true);
  });

  test('should add and retrieve responses', () => {
    const assessment = new AssessmentModel();
    const response = { questionId: '1', answer: 'Test', timestamp: new Date() };
    
    assessment.addResponse(response);
    expect(assessment.getResponseForQuestion('1')).toEqual(response);
  });
});

// Question Model Tests
describe('QuestionModel', () => {
  test('should create mood question correctly', () => {
    const question = QuestionModel.createMoodQuestion();
    
    expect(question.type).toBe('multiple-choice');
    expect(question.options).toHaveLength(5);
    expect(question.required).toBe(true);
  });

  test('should validate multiple choice questions', () => {
    const question = new QuestionModel({
      text: 'Test question',
      type: 'multiple-choice',
      options: ['Option 1'] // Only one option - should be invalid
    });
    
    const validation = question.validate();
    expect(validation.isValid).toBe(false);
  });

  test('should validate responses correctly', () => {
    const question = QuestionModel.createMoodQuestion();
    const validResponse = { questionId: question.id, answer: 'Good', timestamp: new Date() };
    const invalidResponse = { questionId: question.id, answer: 'Invalid Option', timestamp: new Date() };
    
    expect(question.validateResponse(validResponse).isValid).toBe(true);
    expect(question.validateResponse(invalidResponse).isValid).toBe(false);
  });
});

// UserResponse Model Tests
describe('UserResponseModel', () => {
  test('should create different response types', () => {
    const textResponse = UserResponseModel.createTextResponse('q1', 'Hello');
    const scaleResponse = UserResponseModel.createScaleResponse('q2', 7);
    const yesNoResponse = UserResponseModel.createYesNoResponse('q3', true);
    
    expect(textResponse.getStringAnswer()).toBe('Hello');
    expect(scaleResponse.getNumericAnswer()).toBe(7);
    expect(yesNoResponse.getBooleanAnswer()).toBe(true);
  });

  test('should validate response data', () => {
    const response = new UserResponseModel({
      questionId: '', // Invalid - empty
      answer: 'Test'
    });
    
    const validation = response.validate();
    expect(validation.isValid).toBe(false);
  });

  test('should handle different answer type conversions', () => {
    const response = new UserResponseModel({
      questionId: 'test',
      answer: ['option1', 'option2']
    });
    
    expect(response.getArrayAnswer()).toEqual(['option1', 'option2']);
    expect(response.getStringAnswer()).toBe('option1, option2');
  });

  test('should clamp scale values', () => {
    const response = UserResponseModel.createScaleResponse('q1', 15); // Above max
    expect(response.getNumericAnswer()).toBe(10);
    
    const response2 = UserResponseModel.createScaleResponse('q2', -5); // Below min
    expect(response2.getNumericAnswer()).toBe(1);
  });
});

// Mock test framework functions for this example
function describe(name: string, fn: () => void) {
  console.log(`\n--- ${name} ---`);
  fn();
}

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.log(`✗ ${name}: ${error}`);
  }
}

function expect(actual: any) {
  return {
    toBe: (expected: any) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toEqual: (expected: any) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toBeTruthy: () => {
      if (!actual) {
        throw new Error(`Expected truthy value, got ${actual}`);
      }
    },
    toBeInstanceOf: (constructor: any) => {
      if (!(actual instanceof constructor)) {
        throw new Error(`Expected instance of ${constructor.name}, got ${typeof actual}`);
      }
    },
    toHaveLength: (length: number) => {
      if (!actual || actual.length !== length) {
        throw new Error(`Expected length ${length}, got ${actual ? actual.length : 'undefined'}`);
      }
    },
    toBeGreaterThan: (value: number) => {
      if (actual <= value) {
        throw new Error(`Expected ${actual} to be greater than ${value}`);
      }
    },
    toContain: (item: any) => {
      if (!actual || !actual.includes(item)) {
        throw new Error(`Expected array to contain ${item}`);
      }
    }
  };
}
// Ad
ditional tests for Recommendation and Progress models

import { RecommendationModel } from '../models/Recommendation.js';
import { UserProgressModel } from '../models/UserProgress.js';
import { AchievementModel } from '../models/Achievement.js';

// Recommendation Model Tests
describe('RecommendationModel', () => {
  test('should create with default values', () => {
    const recommendation = new RecommendationModel();
    
    expect(recommendation.type).toBe('affirmation');
    expect(recommendation.estimatedTime).toBe(5);
    expect(recommendation.difficultyLevel).toBe('easy');
    expect(recommendation.effectiveness).toBe(5);
  });

  test('should validate recommendation types correctly', () => {
    expect(RecommendationModel.isValidRecommendationType('focus-technique')).toBe(true);
    expect(RecommendationModel.isValidRecommendationType('invalid')).toBe(false);
  });

  test('should create focus recommendations', () => {
    const recommendation = RecommendationModel.createFocusRecommendation({});
    
    expect(recommendation.type).toBe('focus-technique');
    expect(recommendation.title).toBeTruthy();
    expect(recommendation.description).toBeTruthy();
  });

  test('should categorize time correctly', () => {
    const quickRec = new RecommendationModel({ estimatedTime: 3 });
    const longRec = new RecommendationModel({ estimatedTime: 45 });
    
    expect(quickRec.getTimeCategory()).toBe('quick');
    expect(longRec.getTimeCategory()).toBe('long');
  });

  test('should check accessibility constraints', () => {
    const recommendation = new RecommendationModel({
      estimatedTime: 10,
      difficultyLevel: 'moderate'
    });
    
    expect(recommendation.isAccessible(15, 'challenging')).toBe(true);
    expect(recommendation.isAccessible(5, 'easy')).toBe(false);
  });

  test('should validate recommendation data', () => {
    const recommendation = new RecommendationModel({
      title: '', // Invalid - empty
      estimatedTime: 200 // Invalid - too long
    });
    
    const validation = recommendation.validate();
    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });
});

// UserProgress Model Tests
describe('UserProgressModel', () => {
  test('should create with default values', () => {
    const progress = new UserProgressModel();
    
    expect(progress.userId).toBeTruthy();
    expect(progress.assessmentHistory).toEqual([]);
    expect(progress.completedRecommendations).toEqual([]);
    expect(progress.wellnessStreak).toBe(0);
    expect(progress.achievements).toEqual([]);
  });

  test('should add and track assessments', () => {
    const progress = new UserProgressModel();
    const assessment = {
      id: 'test1',
      timestamp: new Date(),
      type: 'daily-checkin' as any,
      questions: [],
      responses: [],
      summary: { overallState: '', keyInsights: [], priorityAreas: [], strengths: [] },
      recommendedActions: []
    };
    
    progress.addAssessment(assessment);
    expect(progress.assessmentHistory).toHaveLength(1);
  });

  test('should get recent assessments', () => {
    const progress = new UserProgressModel();
    const oldAssessment = {
      id: 'old',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      type: 'daily-checkin' as any,
      questions: [],
      responses: [],
      summary: { overallState: '', keyInsights: [], priorityAreas: [], strengths: [] },
      recommendedActions: []
    };
    const recentAssessment = {
      id: 'recent',
      timestamp: new Date(),
      type: 'daily-checkin' as any,
      questions: [],
      responses: [],
      summary: { overallState: '', keyInsights: [], priorityAreas: [], strengths: [] },
      recommendedActions: []
    };
    
    progress.addAssessment(oldAssessment);
    progress.addAssessment(recentAssessment);
    
    const recent = progress.getRecentAssessments(7);
    expect(recent).toHaveLength(1);
    expect(recent[0].id).toBe('recent');
  });

  test('should track completed recommendations', () => {
    const progress = new UserProgressModel();
    const completed = {
      recommendationId: 'rec1',
      completedAt: new Date(),
      effectiveness: 8,
      userFeedback: 'Very helpful'
    };
    
    progress.addCompletedRecommendation(completed);
    expect(progress.completedRecommendations).toHaveLength(1);
  });

  test('should generate progress summary', () => {
    const progress = new UserProgressModel();
    const summary = progress.getProgressSummary();
    
    expect(summary.totalAssessments).toBe(0);
    expect(summary.totalRecommendations).toBe(0);
    expect(summary.currentStreak).toBe(0);
    expect(summary.totalAchievements).toBe(0);
    expect(summary.recentTrends).toBeTruthy();
  });
});

// Achievement Model Tests
describe('AchievementModel', () => {
  test('should create with default values', () => {
    const achievement = new AchievementModel();
    
    expect(achievement.id).toBeTruthy();
    expect(achievement.unlockedAt).toBeInstanceOf(Date);
    expect(achievement.category).toBe('milestone');
  });

  test('should create first assessment achievement', () => {
    const achievement = AchievementModel.createFirstAssessmentAchievement();
    
    expect(achievement.id).toBe('first-assessment');
    expect(achievement.title).toBe('Getting Started');
    expect(achievement.category).toBe('milestone');
  });

  test('should create consistency achievements', () => {
    const achievement = AchievementModel.createConsistencyAchievement(7);
    
    expect(achievement.id).toBe('7-day-streak');
    expect(achievement.title).toBe('Week Warrior');
    expect(achievement.category).toBe('consistency');
  });

  test('should create milestone achievements', () => {
    const achievement = AchievementModel.createMilestoneAchievement(10, 'assessments');
    
    expect(achievement.id).toBe('10-assessments');
    expect(achievement.title).toBe('Reflection Master');
    expect(achievement.category).toBe('milestone');
  });

  test('should get appropriate emoji for category', () => {
    const consistencyAchievement = new AchievementModel({ category: 'consistency' });
    const growthAchievement = new AchievementModel({ category: 'growth' });
    
    expect(consistencyAchievement.getEmoji()).toBe('🔥');
    expect(growthAchievement.getEmoji()).toBe('🌱');
  });

  test('should calculate days unlocked', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const achievement = new AchievementModel({ unlockedAt: yesterday });
    expect(achievement.getDaysUnlocked()).toBe(1);
  });

  test('should detect recent achievements', () => {
    const recentAchievement = new AchievementModel({ unlockedAt: new Date() });
    const oldAchievement = new AchievementModel({ 
      unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) 
    });
    
    expect(recentAchievement.isRecent()).toBe(true);
    expect(oldAchievement.isRecent()).toBe(false);
  });

  test('should validate achievement data', () => {
    const achievement = new AchievementModel({
      title: '', // Invalid - empty
      category: 'invalid' as any // Invalid category
    });
    
    const validation = achievement.validate();
    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });
});