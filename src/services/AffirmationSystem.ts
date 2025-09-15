// Affirmation system for personalized encouragement and support

import { UserState, Achievement, UserPreferences } from '../models/types.js';
import { Affirmation, Celebration, ComfortMessage, DistressLevel } from './interfaces.js';

export class AffirmationSystem {
  private affirmationDatabase: AffirmationTemplate[];
  private celebrationMessages: CelebrationTemplate[];
  private comfortMessages: ComfortTemplate[];
  private currentTone: 'gentle' | 'direct' | 'encouraging' = 'gentle';

  constructor() {
    this.affirmationDatabase = this.initializeAffirmations();
    this.celebrationMessages = this.initializeCelebrations();
    this.comfortMessages = this.initializeComfortMessages();
  }

  generatePersonalizedAffirmation(userState: UserState): Affirmation {
    const relevantAffirmations = this.selectRelevantAffirmations(userState);
    const selectedTemplate = this.selectBestAffirmation(relevantAffirmations, userState);
    
    return {
      text: this.personalizeAffirmation(selectedTemplate, userState),
      category: selectedTemplate.category,
      personalizedElements: this.extractPersonalizedElements(userState)
    };
  }

  celebrateAchievement(achievement: Achievement): Celebration {
    const template = this.celebrationMessages.find(c => c.category === achievement.category) 
                    || this.celebrationMessages[0];

    return {
      message: this.personalizeCelebration(template.message, achievement),
      visualEffect: template.visualEffect,
      soundEffect: template.soundEffect,
      badge: achievement
    };
  }

  provideComfort(distressLevel: DistressLevel): ComfortMessage {
    const relevantComfort = this.comfortMessages.filter(c => c.distressLevel === distressLevel);
    const selectedComfort = relevantComfort[Math.floor(Math.random() * relevantComfort.length)];

    return {
      text: selectedComfort.message,
      tone: selectedComfort.tone,
      followUpSuggestions: selectedComfort.followUpSuggestions
    };
  }

  adaptTone(userPreferences: UserPreferences): void {
    this.currentTone = userPreferences.communicationStyle;
  }

  private selectRelevantAffirmations(userState: UserState): AffirmationTemplate[] {
    let relevant: AffirmationTemplate[] = [];

    // Select based on mood
    if (userState.currentMood === 'very-low' || userState.currentMood === 'low') {
      relevant.push(...this.affirmationDatabase.filter(a => a.category === 'self-compassion'));
    }

    // Select based on stress
    if (userState.stressLevel === 'high' || userState.stressLevel === 'overwhelming') {
      relevant.push(...this.affirmationDatabase.filter(a => a.category === 'acceptance'));
    }

    // Select based on focus challenges
    if (userState.focusCapacity === 'scattered' || userState.focusCapacity === 'unfocused') {
      relevant.push(...this.affirmationDatabase.filter(a => a.category === 'strength'));
    }

    // Always include progress affirmations
    relevant.push(...this.affirmationDatabase.filter(a => a.category === 'progress'));

    // If no specific matches, return all
    if (relevant.length === 0) {
      relevant = this.affirmationDatabase;
    }

    return relevant;
  }

  private selectBestAffirmation(affirmations: AffirmationTemplate[], userState: UserState): AffirmationTemplate {
    // Score affirmations based on relevance
    const scored = affirmations.map(affirmation => ({
      affirmation,
      score: this.calculateRelevanceScore(affirmation, userState)
    }));

    // Sort by score and add some randomness
    scored.sort((a, b) => b.score - a.score);
    const topCandidates = scored.slice(0, Math.min(3, scored.length));
    
    return topCandidates[Math.floor(Math.random() * topCandidates.length)].affirmation;
  }

  private calculateRelevanceScore(affirmation: AffirmationTemplate, userState: UserState): number {
    let score = 0;

    // Base score
    score += affirmation.baseRelevance;

    // Mood-based scoring
    if (userState.currentMood === 'very-low' && affirmation.category === 'self-compassion') score += 3;
    if (userState.currentMood === 'low' && affirmation.category === 'self-compassion') score += 2;

    // Stress-based scoring
    if (userState.stressLevel === 'overwhelming' && affirmation.category === 'acceptance') score += 3;
    if (userState.stressLevel === 'high' && affirmation.category === 'acceptance') score += 2;

    // Energy-based scoring
    if (userState.energyLevel === 'depleted' && affirmation.category === 'self-compassion') score += 2;

    // Communication style adjustment
    if (this.currentTone === 'encouraging' && affirmation.tone === 'encouraging') score += 1;
    if (this.currentTone === 'gentle' && affirmation.tone === 'gentle') score += 1;

    return score;
  }

  private personalizeAffirmation(template: AffirmationTemplate, userState: UserState): string {
    let personalized = template.text;

    // Add contextual elements based on user state
    if (userState.energyLevel === 'low' || userState.energyLevel === 'depleted') {
      personalized += " Rest is productive too.";
    }

    if (userState.stressLevel === 'high' || userState.stressLevel === 'overwhelming') {
      personalized += " You're handling more than most people could.";
    }

    return personalized;
  }

  private personalizeCelebration(message: string, achievement: Achievement): string {
    return message.replace('{achievement}', achievement.title);
  }

  private extractPersonalizedElements(userState: UserState): string[] {
    const elements: string[] = [];

    if (userState.currentMood === 'good' || userState.currentMood === 'excellent') {
      elements.push('positive-energy');
    }

    if (userState.focusCapacity === 'focused' || userState.focusCapacity === 'hyperfocused') {
      elements.push('focus-strength');
    }

    if (userState.stressLevel === 'calm' || userState.stressLevel === 'mild') {
      elements.push('inner-peace');
    }

    return elements;
  }

  private initializeAffirmations(): AffirmationTemplate[] {
    return [
      {
        id: 'self-compassion-1',
        category: 'self-compassion',
        text: "You're doing the best you can with the energy you have today.",
        tone: 'gentle',
        baseRelevance: 8,
        triggers: ['low-mood', 'high-stress']
      },
      {
        id: 'self-compassion-2',
        category: 'self-compassion',
        text: "Your worth isn't measured by your productivity.",
        tone: 'gentle',
        baseRelevance: 9,
        triggers: ['low-energy', 'overwhelm']
      },
      {
        id: 'strength-1',
        category: 'strength',
        text: "Your neurodivergent brain sees patterns and connections others miss.",
        tone: 'encouraging',
        baseRelevance: 7,
        triggers: ['focus-challenges', 'self-doubt']
      },
      {
        id: 'strength-2',
        category: 'strength',
        text: "You've overcome challenges before, and you have that same strength now.",
        tone: 'encouraging',
        baseRelevance: 8,
        triggers: ['difficulty', 'stress']
      },
      {
        id: 'progress-1',
        category: 'progress',
        text: "Every small step forward is worth celebrating.",
        tone: 'encouraging',
        baseRelevance: 7,
        triggers: ['slow-progress', 'impatience']
      },
      {
        id: 'progress-2',
        category: 'progress',
        text: "Progress isn't always visible, but it's always happening.",
        tone: 'gentle',
        baseRelevance: 6,
        triggers: ['stagnation', 'frustration']
      },
      {
        id: 'acceptance-1',
        category: 'acceptance',
        text: "It's okay to have difficult days. They don't define you.",
        tone: 'gentle',
        baseRelevance: 8,
        triggers: ['bad-day', 'self-criticism']
      },
      {
        id: 'acceptance-2',
        category: 'acceptance',
        text: "You don't have to be perfect to be worthy of love and respect.",
        tone: 'gentle',
        baseRelevance: 9,
        triggers: ['perfectionism', 'self-judgment']
      }
    ];
  }

  private initializeCelebrations(): CelebrationTemplate[] {
    return [
      {
        category: 'consistency',
        message: 'Amazing! You completed {achievement}. Consistency is your superpower!',
        visualEffect: 'sparkles',
        soundEffect: 'gentle-chime'
      },
      {
        category: 'growth',
        message: 'Look at you growing! {achievement} shows how far you\'ve come.',
        visualEffect: 'growing-plant',
        soundEffect: 'success-tone'
      },
      {
        category: 'milestone',
        message: 'Milestone reached! {achievement} is a big deal - celebrate yourself!',
        visualEffect: 'fireworks',
        soundEffect: 'celebration'
      },
      {
        category: 'wellness',
        message: 'Self-care win! {achievement} shows you\'re prioritizing your wellbeing.',
        visualEffect: 'gentle-glow',
        soundEffect: 'peaceful-bell'
      }
    ];
  }

  private initializeComfortMessages(): ComfortTemplate[] {
    return [
      {
        distressLevel: 'mild',
        message: "I notice you're feeling a bit off today. That's completely normal and okay.",
        tone: 'gentle',
        followUpSuggestions: [
          "Take a few deep breaths",
          "Try a short walk or gentle movement",
          "Listen to calming music"
        ]
      },
      {
        distressLevel: 'moderate',
        message: "You're going through a tough time right now, and I want you to know that's okay. You're not alone.",
        tone: 'understanding',
        followUpSuggestions: [
          "Practice grounding techniques",
          "Reach out to a friend or family member",
          "Try a guided meditation",
          "Write down your feelings"
        ]
      },
      {
        distressLevel: 'high',
        message: "I can see you're really struggling right now. Please be gentle with yourself - you're doing the best you can.",
        tone: 'understanding',
        followUpSuggestions: [
          "Focus on basic needs: water, food, rest",
          "Use crisis coping skills you've learned",
          "Contact your support system",
          "Consider professional help if needed"
        ]
      },
      {
        distressLevel: 'crisis',
        message: "You're in a lot of pain right now, and I'm concerned about you. Please reach out for help - you deserve support.",
        tone: 'understanding',
        followUpSuggestions: [
          "Call a crisis helpline: 988 or 741741",
          "Go to your nearest emergency room",
          "Call a trusted friend or family member",
          "Contact your mental health provider"
        ]
      }
    ];
  }
}

interface AffirmationTemplate {
  id: string;
  category: 'self-compassion' | 'strength' | 'progress' | 'acceptance';
  text: string;
  tone: 'gentle' | 'encouraging';
  baseRelevance: number;
  triggers: string[];
}

interface CelebrationTemplate {
  category: 'consistency' | 'growth' | 'milestone' | 'wellness';
  message: string;
  visualEffect: string;
  soundEffect: string;
}

interface ComfortTemplate {
  distressLevel: DistressLevel;
  message: string;
  tone: 'gentle' | 'understanding' | 'encouraging';
  followUpSuggestions: string[];
}