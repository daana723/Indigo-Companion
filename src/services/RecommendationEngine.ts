// Recommendation engine for personalized ADHD support

import { UserState, Recommendation, RecommendationType, DifficultyLevel } from '../models/types.js';
import { Feedback, Outcome } from './interfaces.js';

export class RecommendationEngine {
  private recommendationDatabase: RecommendationTemplate[];
  private effectivenessHistory: Map<string, number[]> = new Map();

  constructor() {
    this.recommendationDatabase = this.initializeRecommendations();
  }

  generateRecommendations(userState: UserState): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Generate focus recommendations
    if (userState.focusCapacity === 'scattered' || userState.focusCapacity === 'unfocused') {
      recommendations.push(...this.getFocusRecommendations(userState));
    }

    // Generate energy recommendations
    if (userState.energyLevel === 'depleted' || userState.energyLevel === 'low') {
      recommendations.push(...this.getEnergyRecommendations(userState));
    }

    // Generate mood recommendations
    if (userState.currentMood === 'very-low' || userState.currentMood === 'low') {
      recommendations.push(...this.getMoodRecommendations(userState));
    }

    // Generate stress management recommendations
    if (userState.stressLevel === 'high' || userState.stressLevel === 'overwhelming') {
      recommendations.push(...this.getStressRecommendations(userState));
    }

    // Always include at least one affirmation
    recommendations.push(this.getAffirmationRecommendation(userState));

    return this.prioritizeByUrgency(recommendations).slice(0, 5); // Return top 5
  }

  adaptToFeedback(recommendation: Recommendation, feedback: Feedback): void {
    const effectivenessScores = this.effectivenessHistory.get(recommendation.id) || [];
    effectivenessScores.push(feedback.rating);
    this.effectivenessHistory.set(recommendation.id, effectivenessScores);

    // Update recommendation effectiveness
    const avgEffectiveness = effectivenessScores.reduce((a, b) => a + b, 0) / effectivenessScores.length;
    recommendation.effectiveness = avgEffectiveness;
  }

  prioritizeByUrgency(recommendations: Recommendation[]): Recommendation[] {
    return recommendations.sort((a, b) => {
      // Prioritize by effectiveness and urgency
      const urgencyScore = this.calculateUrgencyScore(a) - this.calculateUrgencyScore(b);
      if (urgencyScore !== 0) return urgencyScore;
      
      return b.effectiveness - a.effectiveness;
    });
  }

  trackEffectiveness(recommendation: Recommendation, outcome: Outcome): void {
    const effectiveness = outcome.completed ? outcome.effectiveness : 0;
    this.adaptToFeedback(recommendation, {
      rating: effectiveness,
      comment: '',
      helpful: outcome.completed,
      timestamp: new Date()
    });
  }

  private getFocusRecommendations(userState: UserState): Recommendation[] {
    const templates = this.recommendationDatabase.filter(t => t.category === 'focus');
    return templates.map(template => this.createRecommendationFromTemplate(template, userState));
  }

  private getEnergyRecommendations(userState: UserState): Recommendation[] {
    const templates = this.recommendationDatabase.filter(t => t.category === 'energy');
    return templates.map(template => this.createRecommendationFromTemplate(template, userState));
  }

  private getMoodRecommendations(userState: UserState): Recommendation[] {
    const templates = this.recommendationDatabase.filter(t => t.category === 'mood');
    return templates.map(template => this.createRecommendationFromTemplate(template, userState));
  }

  private getStressRecommendations(userState: UserState): Recommendation[] {
    const templates = this.recommendationDatabase.filter(t => t.category === 'stress');
    return templates.map(template => this.createRecommendationFromTemplate(template, userState));
  }

  private getAffirmationRecommendation(userState: UserState): Recommendation {
    const affirmations = [
      "You're doing better than you think you are.",
      "Your neurodivergent brain is a gift, not a burden.",
      "Progress isn't always linear, and that's perfectly okay.",
      "You have unique strengths that the world needs.",
      "It's okay to take breaks and be gentle with yourself."
    ];

    const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];

    return {
      id: `affirmation-${Date.now()}`,
      type: 'affirmation',
      title: 'Gentle Reminder',
      description: randomAffirmation,
      estimatedTime: 1,
      difficultyLevel: 'easy',
      effectiveness: 8,
      personalizedReason: 'A moment of self-compassion can shift your entire day.'
    };
  }

  private calculateUrgencyScore(recommendation: Recommendation): number {
    let score = 0;
    
    if (recommendation.type === 'focus-technique') score += 3;
    if (recommendation.difficultyLevel === 'easy') score += 2;
    if (recommendation.estimatedTime <= 5) score += 2;
    if (recommendation.effectiveness >= 7) score += 1;

    return score;
  }

  private createRecommendationFromTemplate(template: RecommendationTemplate, userState: UserState): Recommendation {
    return {
      id: `${template.id}-${Date.now()}`,
      type: template.type,
      title: template.title,
      description: template.description,
      estimatedTime: template.estimatedTime,
      difficultyLevel: template.difficulty,
      effectiveness: template.baseEffectiveness,
      personalizedReason: this.personalizeReason(template.reason, userState)
    };
  }

  private personalizeReason(reason: string, userState: UserState): string {
    // Simple personalization based on user state
    if (userState.energyLevel === 'low') {
      return reason + " This gentle approach works well when energy is limited.";
    }
    if (userState.stressLevel === 'high') {
      return reason + " This can help bring your stress levels down.";
    }
    return reason;
  }

  private initializeRecommendations(): RecommendationTemplate[] {
    return [
      {
        id: 'pomodoro-focus',
        category: 'focus',
        type: 'focus-technique',
        title: 'Gentle Pomodoro (15 minutes)',
        description: 'Work for 15 minutes, then take a 5-minute break. Perfect for ADHD brains.',
        estimatedTime: 20,
        difficulty: 'easy',
        baseEffectiveness: 8,
        reason: 'Short bursts of focus work better for neurodivergent minds.'
      },
      {
        id: 'body-doubling',
        category: 'focus',
        type: 'focus-technique',
        title: 'Virtual Body Doubling',
        description: 'Work alongside others virtually to maintain focus and accountability.',
        estimatedTime: 30,
        difficulty: 'moderate',
        baseEffectiveness: 7,
        reason: 'Social presence can help maintain attention and reduce procrastination.'
      },
      {
        id: 'energy-walk',
        category: 'energy',
        type: 'wellness-practice',
        title: '5-Minute Energy Walk',
        description: 'A short walk to boost energy and clear your mind.',
        estimatedTime: 5,
        difficulty: 'easy',
        baseEffectiveness: 7,
        reason: 'Movement helps regulate dopamine and increase alertness.'
      },
      {
        id: 'breathing-calm',
        category: 'stress',
        type: 'wellness-practice',
        title: '4-7-8 Breathing',
        description: 'Breathe in for 4, hold for 7, exhale for 8. Repeat 4 times.',
        estimatedTime: 3,
        difficulty: 'easy',
        baseEffectiveness: 8,
        reason: 'This breathing pattern activates your parasympathetic nervous system.'
      },
      {
        id: 'mood-journaling',
        category: 'mood',
        type: 'wellness-practice',
        title: 'Quick Mood Check',
        description: 'Write down 3 things: how you feel, why, and one small positive.',
        estimatedTime: 5,
        difficulty: 'easy',
        baseEffectiveness: 6,
        reason: 'Acknowledging feelings helps process emotions and find perspective.'
      }
    ];
  }
}

interface RecommendationTemplate {
  id: string;
  category: 'focus' | 'energy' | 'mood' | 'stress';
  type: RecommendationType;
  title: string;
  description: string;
  estimatedTime: number;
  difficulty: DifficultyLevel;
  baseEffectiveness: number;
  reason: string;
}