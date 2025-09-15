// Main companion controller that orchestrates all engine components

import { UserState, Assessment, Recommendation, UserResponse, AssessmentType } from '../models/types.js';
import { AssessmentEngine } from './AssessmentEngine.js';
import { RecommendationEngine } from './RecommendationEngine.js';
import { AffirmationSystem } from './AffirmationSystem.js';
import { WellnessPractices } from './WellnessPractices.js';
import { QuestionEngine } from './QuestionEngine.js';
import { LocalStorageManager } from './LocalStorageManager.js';
import { validateUserState, validateUserResponse } from '../utils/validation.js';

export class CompanionCore {
  private assessmentEngine: AssessmentEngine;
  private recommendationEngine: RecommendationEngine;
  private affirmationSystem: AffirmationSystem;
  private wellnessPractices: WellnessPractices;
  private questionEngine: QuestionEngine;
  private storageManager: LocalStorageManager;
  private currentUserState: UserState | null = null;
  private currentAssessment: Assessment | null = null;

  constructor() {
    this.assessmentEngine = new AssessmentEngine();
    this.recommendationEngine = new RecommendationEngine();
    this.affirmationSystem = new AffirmationSystem();
    this.wellnessPractices = new WellnessPractices();
    this.questionEngine = new QuestionEngine();
    this.storageManager = new LocalStorageManager();
  }

  async initializeSession(userId: string): Promise<void> {
    try {
      const userData = await this.storageManager.retrieveUserData(userId);
      if (userData && userData.userState) {
        this.currentUserState = validateUserState(userData.userState);
      }
    } catch (error) {
      console.warn('Could not load user data, starting fresh session:', error);
    }
  }

  async startAssessment(type: AssessmentType): Promise<Assessment> {
    this.currentAssessment = this.assessmentEngine.initiateAssessment(type);
    return this.currentAssessment;
  }

  async processResponse(response: UserResponse): Promise<{
    nextQuestion?: any;
    isComplete: boolean;
    summary?: any;
    recommendations?: Recommendation[];
  }> {
    if (!this.currentAssessment) {
      throw new Error('No active assessment');
    }

    const validatedResponse = validateUserResponse(response);
    const assessmentState = this.assessmentEngine.processResponse(validatedResponse);

    if (assessmentState.isComplete) {
      const summary = this.assessmentEngine.generateSummary(this.currentAssessment);
      this.currentUserState = this.extractUserStateFromAssessment(this.currentAssessment);
      
      const recommendations = this.recommendationEngine.generateRecommendations(this.currentUserState);
      
      // Save progress
      await this.saveUserProgress();

      return {
        isComplete: true,
        summary,
        recommendations
      };
    } else {
      const nextQuestion = this.questionEngine.generateContextualQuestions(this.currentUserState || this.getDefaultUserState())[0];
      return {
        nextQuestion,
        isComplete: false
      };
    }
  }

  async getPersonalizedAffirmation(): Promise<string> {
    const userState = this.currentUserState || this.getDefaultUserState();
    const affirmation = this.affirmationSystem.generatePersonalizedAffirmation(userState);
    return affirmation.text;
  }

  async suggestWellnessPractice(timeAvailable: number = 10): Promise<any> {
    const userState = this.currentUserState || this.getDefaultUserState();
    const practices = this.wellnessPractices.suggestPractices(userState, timeAvailable);
    return practices[0]; // Return the top suggestion
  }

  async detectCrisisState(): Promise<boolean> {
    if (!this.currentUserState) return false;
    
    return (
      this.currentUserState.stressLevel === 'overwhelming' ||
      this.currentUserState.currentMood === 'very-low'
    );
  }

  async provideCrisisSupport(): Promise<{
    message: string;
    resources: string[];
    immediateActions: string[];
  }> {
    return {
      message: "I notice you're going through a really tough time right now. You're not alone, and it's okay to ask for help.",
      resources: [
        "Crisis Text Line: Text HOME to 741741",
        "National Suicide Prevention Lifeline: 988",
        "ADHD support communities and forums"
      ],
      immediateActions: [
        "Take three deep breaths with me",
        "Find a safe, comfortable space",
        "Reach out to a trusted friend or family member",
        "Consider contacting a mental health professional"
      ]
    };
  }

  private extractUserStateFromAssessment(assessment: Assessment): UserState {
    // Extract user state from assessment responses
    // This is a simplified implementation - in reality, this would be more sophisticated
    const responses = assessment.responses;
    
    return {
      currentMood: this.extractMoodFromResponses(responses),
      energyLevel: this.extractEnergyFromResponses(responses),
      focusCapacity: this.extractFocusFromResponses(responses),
      stressLevel: this.extractStressFromResponses(responses),
      recentChallenges: [],
      preferences: {
        communicationStyle: 'gentle',
        preferredPractices: [],
        timePreferences: {
          preferredSessionLength: 10,
          reminderFrequency: 'moderate',
          bestTimeOfDay: 'flexible'
        },
        accessibilitySettings: {
          fontSize: 'medium',
          theme: 'dark',
          animations: true,
          soundEffects: false
        }
      },
      accessibilityNeeds: {
        screenReader: false,
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        voiceInput: false
      }
    };
  }

  private extractMoodFromResponses(responses: UserResponse[]): any {
    // Simplified mood extraction - would be more sophisticated in practice
    return 'neutral';
  }

  private extractEnergyFromResponses(responses: UserResponse[]): any {
    return 'moderate';
  }

  private extractFocusFromResponses(responses: UserResponse[]): any {
    return 'moderate';
  }

  private extractStressFromResponses(responses: UserResponse[]): any {
    return 'mild';
  }

  private getDefaultUserState(): UserState {
    return {
      currentMood: 'neutral',
      energyLevel: 'moderate',
      focusCapacity: 'moderate',
      stressLevel: 'mild',
      recentChallenges: [],
      preferences: {
        communicationStyle: 'gentle',
        preferredPractices: [],
        timePreferences: {
          preferredSessionLength: 10,
          reminderFrequency: 'moderate',
          bestTimeOfDay: 'flexible'
        },
        accessibilitySettings: {
          fontSize: 'medium',
          theme: 'dark',
          animations: true,
          soundEffects: false
        }
      },
      accessibilityNeeds: {
        screenReader: false,
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        voiceInput: false
      }
    };
  }

  private async saveUserProgress(): Promise<void> {
    if (this.currentUserState) {
      await this.storageManager.storeUserData('default-user', {
        userState: this.currentUserState,
        lastAssessment: this.currentAssessment,
        timestamp: new Date()
      });
    }
  }
}