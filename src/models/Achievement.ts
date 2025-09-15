import { Achievement } from './types.js';

export class AchievementModel implements Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: Date;
  category: 'consistency' | 'growth' | 'milestone' | 'wellness';

  constructor(data: Partial<Achievement> = {}) {
    this.id = data.id || this.generateId();
    this.title = data.title || '';
    this.description = data.description || '';
    this.unlockedAt = data.unlockedAt || new Date();
    this.category = data.category || 'milestone';
  }

  private generateId(): string {
    return `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.title.trim()) {
      errors.push('Achievement must have a title');
    }

    if (!this.description.trim()) {
      errors.push('Achievement must have a description');
    }

    if (!['consistency', 'growth', 'milestone', 'wellness'].includes(this.category)) {
      errors.push('Invalid achievement category');
    }

    if (!this.unlockedAt || !(this.unlockedAt instanceof Date)) {
      errors.push('Achievement must have a valid unlock date');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Factory methods for common achievements
  static createFirstAssessmentAchievement(): AchievementModel {
    return new AchievementModel({
      id: 'first-assessment',
      title: 'Getting Started',
      description: 'Completed your first self-assessment. Every journey begins with a single step!',
      category: 'milestone'
    });
  }

  static createConsistencyAchievement(days: number): AchievementModel {
    const titles = {
      3: 'Building Momentum',
      7: 'Week Warrior',
      14: 'Two Week Champion',
      30: 'Monthly Master'
    };

    const descriptions = {
      3: 'Completed wellness practices for 3 days in a row. You\'re building great habits!',
      7: 'Maintained wellness practices for a full week. Your consistency is inspiring!',
      14: 'Two weeks of dedication to your wellness. You\'re creating lasting change!',
      30: 'A full month of wellness commitment. You\'ve truly embraced self-care!'
    };

    return new AchievementModel({
      id: `${days}-day-streak`,
      title: titles[days as keyof typeof titles] || `${days} Day Streak`,
      description: descriptions[days as keyof typeof descriptions] || `Maintained wellness practices for ${days} days`,
      category: 'consistency'
    });
  }

  static createMilestoneAchievement(count: number, type: 'assessments' | 'recommendations'): AchievementModel {
    const assessmentTitles = {
      5: 'Self-Aware Explorer',
      10: 'Reflection Master',
      25: 'Insight Seeker',
      50: 'Wisdom Gatherer'
    };

    const recommendationTitles = {
      5: 'Action Taker',
      10: 'Active Participant',
      25: 'Wellness Enthusiast',
      50: 'Self-Care Champion'
    };

    const titles = type === 'assessments' ? assessmentTitles : recommendationTitles;
    const action = type === 'assessments' ? 'completed assessments' : 'followed recommendations';

    return new AchievementModel({
      id: `${count}-${type}`,
      title: titles[count as keyof typeof titles] || `${count} ${type}`,
      description: `You've ${action} ${count} times. Your commitment to growth is remarkable!`,
      category: 'milestone'
    });
  }

  static createGrowthAchievement(improvementType: string): AchievementModel {
    const growthTypes = {
      'mood-improvement': {
        title: 'Mood Lifter',
        description: 'Your mood has shown consistent improvement over time. You\'re learning to nurture your emotional well-being!'
      },
      'stress-reduction': {
        title: 'Stress Warrior',
        description: 'You\'ve successfully reduced your stress levels through consistent practice. Your resilience is growing!'
      },
      'focus-enhancement': {
        title: 'Focus Master',
        description: 'Your ability to focus has improved significantly. You\'re developing powerful concentration skills!'
      },
      'energy-boost': {
        title: 'Energy Optimizer',
        description: 'You\'ve learned to better manage and boost your energy levels. Your vitality is flourishing!'
      }
    };

    const achievement = growthTypes[improvementType as keyof typeof growthTypes];
    
    return new AchievementModel({
      id: improvementType,
      title: achievement?.title || 'Personal Growth',
      description: achievement?.description || 'You\'ve shown remarkable personal growth!',
      category: 'growth'
    });
  }

  static createWellnessAchievement(practiceType: string): AchievementModel {
    const wellnessPractices = {
      'mindfulness': {
        title: 'Mindful Moment Maker',
        description: 'You\'ve embraced mindfulness practices and found peace in the present moment.'
      },
      'breathing': {
        title: 'Breath Master',
        description: 'You\'ve discovered the power of conscious breathing for calm and focus.'
      },
      'movement': {
        title: 'Body Wisdom',
        description: 'You\'ve connected with your body through mindful movement practices.'
      },
      'grounding': {
        title: 'Grounded Guardian',
        description: 'You\'ve mastered grounding techniques to stay centered and present.'
      }
    };

    const practice = wellnessPractices[practiceType as keyof typeof wellnessPractices];
    
    return new AchievementModel({
      id: `wellness-${practiceType}`,
      title: practice?.title || 'Wellness Explorer',
      description: practice?.description || 'You\'ve explored new wellness practices with dedication!',
      category: 'wellness'
    });
  }

  // Utility methods
  getEmoji(): string {
    const categoryEmojis = {
      'consistency': '🔥',
      'growth': '🌱',
      'milestone': '🏆',
      'wellness': '🧘'
    };
    
    return categoryEmojis[this.category] || '⭐';
  }

  getDaysUnlocked(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.unlockedAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isRecent(): boolean {
    return this.getDaysUnlocked() <= 7;
  }

  toJSON(): Achievement {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      unlockedAt: this.unlockedAt,
      category: this.category
    };
  }
}