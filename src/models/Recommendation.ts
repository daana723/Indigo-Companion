import { 
  Recommendation, 
  RecommendationType, 
  DifficultyLevel, 
  EffectivenessScore 
} from './types.js';

export class RecommendationModel implements Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  estimatedTime: number;
  difficultyLevel: DifficultyLevel;
  effectiveness: EffectivenessScore;
  personalizedReason: string;

  constructor(data: Partial<Recommendation> = {}) {
    this.id = data.id || this.generateId();
    this.type = data.type || 'affirmation';
    this.title = data.title || '';
    this.description = data.description || '';
    this.estimatedTime = data.estimatedTime || 5;
    this.difficultyLevel = data.difficultyLevel || 'easy';
    this.effectiveness = data.effectiveness || 5;
    this.personalizedReason = data.personalizedReason || '';
  }

  private generateId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Validation methods
  static isValidRecommendationType(type: string): type is RecommendationType {
    return ['focus-technique', 'wellness-practice', 'break-suggestion', 'affirmation'].includes(type);
  }

  static isValidDifficultyLevel(level: string): level is DifficultyLevel {
    return ['easy', 'moderate', 'challenging'].includes(level);
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.title.trim()) {
      errors.push('Recommendation must have a title');
    }

    if (!this.description.trim()) {
      errors.push('Recommendation must have a description');
    }

    if (!RecommendationModel.isValidRecommendationType(this.type)) {
      errors.push('Invalid recommendation type');
    }

    if (!RecommendationModel.isValidDifficultyLevel(this.difficultyLevel)) {
      errors.push('Invalid difficulty level');
    }

    if (this.estimatedTime < 1 || this.estimatedTime > 120) {
      errors.push('Estimated time must be between 1 and 120 minutes');
    }

    if (this.effectiveness < 0 || this.effectiveness > 10) {
      errors.push('Effectiveness score must be between 0 and 10');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Factory methods for common recommendations
  static createFocusRecommendation(userState: any): RecommendationModel {
    const techniques = [
      {
        title: "Pomodoro Technique",
        description: "Work for 25 minutes, then take a 5-minute break. This helps maintain focus while preventing burnout.",
        estimatedTime: 30,
        difficulty: 'easy' as DifficultyLevel
      },
      {
        title: "Body Doubling",
        description: "Work alongside someone else (virtually or in person) to help maintain focus and accountability.",
        estimatedTime: 60,
        difficulty: 'moderate' as DifficultyLevel
      },
      {
        title: "Environment Reset",
        description: "Change your physical environment - move to a different room, adjust lighting, or organize your workspace.",
        estimatedTime: 10,
        difficulty: 'easy' as DifficultyLevel
      }
    ];

    const technique = techniques[Math.floor(Math.random() * techniques.length)];
    
    return new RecommendationModel({
      type: 'focus-technique',
      title: technique.title,
      description: technique.description,
      estimatedTime: technique.estimatedTime,
      difficultyLevel: technique.difficulty,
      effectiveness: 7,
      personalizedReason: "Based on your current focus level, this technique can help you regain concentration."
    });
  }

  static createWellnessRecommendation(userState: any): RecommendationModel {
    const practices = [
      {
        title: "5-4-3-2-1 Grounding",
        description: "Notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.",
        estimatedTime: 5,
        difficulty: 'easy' as DifficultyLevel
      },
      {
        title: "Progressive Muscle Relaxation",
        description: "Tense and release each muscle group in your body, starting from your toes and working up to your head.",
        estimatedTime: 15,
        difficulty: 'moderate' as DifficultyLevel
      },
      {
        title: "Mindful Walking",
        description: "Take a slow walk while focusing on the sensation of your feet touching the ground and your breathing.",
        estimatedTime: 10,
        difficulty: 'easy' as DifficultyLevel
      }
    ];

    const practice = practices[Math.floor(Math.random() * practices.length)];
    
    return new RecommendationModel({
      type: 'wellness-practice',
      title: practice.title,
      description: practice.description,
      estimatedTime: practice.estimatedTime,
      difficultyLevel: practice.difficulty,
      effectiveness: 8,
      personalizedReason: "This practice can help you feel more centered and calm."
    });
  }

  static createBreakRecommendation(userState: any): RecommendationModel {
    const breaks = [
      {
        title: "Gentle Stretching",
        description: "Do some simple neck rolls, shoulder shrugs, and gentle stretches to release physical tension.",
        estimatedTime: 5,
        difficulty: 'easy' as DifficultyLevel
      },
      {
        title: "Hydration Break",
        description: "Get a glass of water and drink it mindfully. Notice the temperature and how it feels as you drink.",
        estimatedTime: 3,
        difficulty: 'easy' as DifficultyLevel
      },
      {
        title: "Fresh Air Moment",
        description: "Step outside or open a window. Take a few deep breaths of fresh air and notice your surroundings.",
        estimatedTime: 5,
        difficulty: 'easy' as DifficultyLevel
      }
    ];

    const breakActivity = breaks[Math.floor(Math.random() * breaks.length)];
    
    return new RecommendationModel({
      type: 'break-suggestion',
      title: breakActivity.title,
      description: breakActivity.description,
      estimatedTime: breakActivity.estimatedTime,
      difficultyLevel: breakActivity.difficulty,
      effectiveness: 6,
      personalizedReason: "Taking regular breaks helps prevent overwhelm and maintains your energy."
    });
  }

  static createAffirmationRecommendation(userState: any): RecommendationModel {
    const affirmations = [
      {
        title: "Self-Compassion Reminder",
        description: "You're doing your best with the resources you have right now, and that's enough.",
        reason: "It's important to be kind to yourself, especially when things feel challenging."
      },
      {
        title: "Strength Acknowledgment",
        description: "Your neurodivergent brain brings unique perspectives and creative solutions to the world.",
        reason: "Recognizing your strengths helps build confidence and self-acceptance."
      },
      {
        title: "Progress Recognition",
        description: "Every small step forward is meaningful progress, even if it doesn't feel like much.",
        reason: "Celebrating small wins helps maintain motivation and positive momentum."
      }
    ];

    const affirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    
    return new RecommendationModel({
      type: 'affirmation',
      title: affirmation.title,
      description: affirmation.description,
      estimatedTime: 2,
      difficultyLevel: 'easy',
      effectiveness: 7,
      personalizedReason: affirmation.reason
    });
  }

  // Utility methods
  getTimeCategory(): 'quick' | 'short' | 'medium' | 'long' {
    if (this.estimatedTime <= 5) return 'quick';
    if (this.estimatedTime <= 15) return 'short';
    if (this.estimatedTime <= 30) return 'medium';
    return 'long';
  }

  isAccessible(maxTime: number, maxDifficulty: DifficultyLevel): boolean {
    const difficultyOrder = { 'easy': 1, 'moderate': 2, 'challenging': 3 };
    const userMaxDifficulty = difficultyOrder[maxDifficulty];
    const recDifficulty = difficultyOrder[this.difficultyLevel];

    return this.estimatedTime <= maxTime && recDifficulty <= userMaxDifficulty;
  }

  toJSON(): Recommendation {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      description: this.description,
      estimatedTime: this.estimatedTime,
      difficultyLevel: this.difficultyLevel,
      effectiveness: this.effectiveness,
      personalizedReason: this.personalizedReason
    };
  }
}