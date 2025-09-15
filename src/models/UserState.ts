import { 
  UserState, 
  MoodLevel, 
  EnergyLevel, 
  FocusLevel, 
  StressLevel,
  Challenge,
  UserPreferences,
  AccessibilityNeeds 
} from './types.js';

export class UserStateModel implements UserState {
  currentMood: MoodLevel;
  energyLevel: EnergyLevel;
  focusCapacity: FocusLevel;
  stressLevel: StressLevel;
  recentChallenges: Challenge[];
  preferences: UserPreferences;
  accessibilityNeeds: AccessibilityNeeds;

  constructor(data: Partial<UserState> = {}) {
    this.currentMood = data.currentMood || 'neutral';
    this.energyLevel = data.energyLevel || 'moderate';
    this.focusCapacity = data.focusCapacity || 'moderate';
    this.stressLevel = data.stressLevel || 'mild';
    this.recentChallenges = data.recentChallenges || [];
    this.preferences = data.preferences || this.getDefaultPreferences();
    this.accessibilityNeeds = data.accessibilityNeeds || this.getDefaultAccessibilityNeeds();
  }

  private getDefaultPreferences(): UserPreferences {
    return {
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
    };
  }

  private getDefaultAccessibilityNeeds(): AccessibilityNeeds {
    return {
      screenReader: false,
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      voiceInput: false
    };
  }

  // Validation methods
  static isValidMoodLevel(mood: string): mood is MoodLevel {
    return ['very-low', 'low', 'neutral', 'good', 'excellent'].includes(mood);
  }

  static isValidEnergyLevel(energy: string): energy is EnergyLevel {
    return ['depleted', 'low', 'moderate', 'high', 'energized'].includes(energy);
  }

  static isValidFocusLevel(focus: string): focus is FocusLevel {
    return ['scattered', 'unfocused', 'moderate', 'focused', 'hyperfocused'].includes(focus);
  }

  static isValidStressLevel(stress: string): stress is StressLevel {
    return ['calm', 'mild', 'moderate', 'high', 'overwhelming'].includes(stress);
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!UserStateModel.isValidMoodLevel(this.currentMood)) {
      errors.push('Invalid mood level');
    }

    if (!UserStateModel.isValidEnergyLevel(this.energyLevel)) {
      errors.push('Invalid energy level');
    }

    if (!UserStateModel.isValidFocusLevel(this.focusCapacity)) {
      errors.push('Invalid focus level');
    }

    if (!UserStateModel.isValidStressLevel(this.stressLevel)) {
      errors.push('Invalid stress level');
    }

    if (!Array.isArray(this.recentChallenges)) {
      errors.push('Recent challenges must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper methods for state analysis
  getOverallWellbeing(): number {
    const moodScore = this.getMoodScore();
    const energyScore = this.getEnergyScore();
    const focusScore = this.getFocusScore();
    const stressScore = this.getStressScore();

    return (moodScore + energyScore + focusScore + stressScore) / 4;
  }

  private getMoodScore(): number {
    const moodScores = {
      'very-low': 1,
      'low': 2,
      'neutral': 3,
      'good': 4,
      'excellent': 5
    };
    return moodScores[this.currentMood];
  }

  private getEnergyScore(): number {
    const energyScores = {
      'depleted': 1,
      'low': 2,
      'moderate': 3,
      'high': 4,
      'energized': 5
    };
    return energyScores[this.energyLevel];
  }

  private getFocusScore(): number {
    const focusScores = {
      'scattered': 1,
      'unfocused': 2,
      'moderate': 3,
      'focused': 4,
      'hyperfocused': 3 // Hyperfocus can be challenging too
    };
    return focusScores[this.focusCapacity];
  }

  private getStressScore(): number {
    const stressScores = {
      'calm': 5,
      'mild': 4,
      'moderate': 3,
      'high': 2,
      'overwhelming': 1
    };
    return stressScores[this.stressLevel];
  }

  needsSupport(): boolean {
    return this.getOverallWellbeing() < 2.5 || 
           this.stressLevel === 'overwhelming' ||
           this.currentMood === 'very-low';
  }

  toJSON(): UserState {
    return {
      currentMood: this.currentMood,
      energyLevel: this.energyLevel,
      focusCapacity: this.focusCapacity,
      stressLevel: this.stressLevel,
      recentChallenges: this.recentChallenges,
      preferences: this.preferences,
      accessibilityNeeds: this.accessibilityNeeds
    };
  }
}