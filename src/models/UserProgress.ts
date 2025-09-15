import { 
  UserProgress, 
  Assessment, 
  CompletedRecommendation, 
  Achievement, 
  IdentifiedPattern 
} from './types.js';

export class UserProgressModel implements UserProgress {
  userId: string;
  assessmentHistory: Assessment[];
  completedRecommendations: CompletedRecommendation[];
  wellnessStreak: number;
  achievements: Achievement[];
  patterns: IdentifiedPattern[];

  constructor(data: Partial<UserProgress> = {}) {
    this.userId = data.userId || this.generateUserId();
    this.assessmentHistory = data.assessmentHistory || [];
    this.completedRecommendations = data.completedRecommendations || [];
    this.wellnessStreak = data.wellnessStreak || 0;
    this.achievements = data.achievements || [];
    this.patterns = data.patterns || [];
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.userId || typeof this.userId !== 'string') {
      errors.push('User progress must have a valid user ID');
    }

    if (!Array.isArray(this.assessmentHistory)) {
      errors.push('Assessment history must be an array');
    }

    if (!Array.isArray(this.completedRecommendations)) {
      errors.push('Completed recommendations must be an array');
    }

    if (typeof this.wellnessStreak !== 'number' || this.wellnessStreak < 0) {
      errors.push('Wellness streak must be a non-negative number');
    }

    if (!Array.isArray(this.achievements)) {
      errors.push('Achievements must be an array');
    }

    if (!Array.isArray(this.patterns)) {
      errors.push('Patterns must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Assessment tracking methods
  addAssessment(assessment: Assessment): void {
    this.assessmentHistory.push(assessment);
    this.assessmentHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Keep only last 30 assessments to manage storage
    if (this.assessmentHistory.length > 30) {
      this.assessmentHistory = this.assessmentHistory.slice(0, 30);
    }
  }

  getRecentAssessments(days: number = 7): Assessment[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.assessmentHistory.filter(
      assessment => assessment.timestamp >= cutoffDate
    );
  }

  getAssessmentTrends(): {
    mood: { average: number; trend: 'improving' | 'declining' | 'stable' };
    energy: { average: number; trend: 'improving' | 'declining' | 'stable' };
    focus: { average: number; trend: 'improving' | 'declining' | 'stable' };
    stress: { average: number; trend: 'improving' | 'declining' | 'stable' };
  } {
    const recent = this.getRecentAssessments(7);
    if (recent.length < 2) {
      return {
        mood: { average: 3, trend: 'stable' },
        energy: { average: 3, trend: 'stable' },
        focus: { average: 3, trend: 'stable' },
        stress: { average: 3, trend: 'stable' }
      };
    }

    // Calculate trends based on first half vs second half of recent assessments
    const midpoint = Math.floor(recent.length / 2);
    const earlier = recent.slice(midpoint);
    const later = recent.slice(0, midpoint);

    return {
      mood: this.calculateTrend(earlier, later, 'mood'),
      energy: this.calculateTrend(earlier, later, 'energy'),
      focus: this.calculateTrend(earlier, later, 'focus'),
      stress: this.calculateTrend(earlier, later, 'stress')
    };
  }

  private calculateTrend(earlier: Assessment[], later: Assessment[], metric: string): 
    { average: number; trend: 'improving' | 'declining' | 'stable' } {
    
    const getMetricValue = (assessment: Assessment): number => {
      // This would need to be implemented based on how metrics are stored in assessments
      // For now, return a placeholder
      return 3;
    };

    const earlierAvg = earlier.reduce((sum, a) => sum + getMetricValue(a), 0) / earlier.length;
    const laterAvg = later.reduce((sum, a) => sum + getMetricValue(a), 0) / later.length;
    
    const difference = laterAvg - earlierAvg;
    const threshold = 0.3;

    let trend: 'improving' | 'declining' | 'stable';
    if (difference > threshold) {
      trend = 'improving';
    } else if (difference < -threshold) {
      trend = 'declining';
    } else {
      trend = 'stable';
    }

    return {
      average: laterAvg,
      trend
    };
  }

  // Recommendation tracking methods
  addCompletedRecommendation(completed: CompletedRecommendation): void {
    this.completedRecommendations.push(completed);
    
    // Update wellness streak if it's a wellness practice
    this.updateWellnessStreak();
    
    // Check for achievements
    this.checkForAchievements();
  }

  getRecommendationEffectiveness(): { [type: string]: number } {
    const effectiveness: { [type: string]: { total: number; count: number } } = {};
    
    this.completedRecommendations.forEach(rec => {
      // We'd need to look up the recommendation type from the ID
      // For now, use a placeholder
      const type = 'wellness-practice';
      
      if (!effectiveness[type]) {
        effectiveness[type] = { total: 0, count: 0 };
      }
      
      effectiveness[type].total += rec.effectiveness;
      effectiveness[type].count += 1;
    });

    const averages: { [type: string]: number } = {};
    Object.keys(effectiveness).forEach(type => {
      averages[type] = effectiveness[type].total / effectiveness[type].count;
    });

    return averages;
  }

  private updateWellnessStreak(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayCompletions = this.completedRecommendations.filter(rec => {
      const completedDate = new Date(rec.completedAt);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    });

    const yesterdayCompletions = this.completedRecommendations.filter(rec => {
      const completedDate = new Date(rec.completedAt);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === yesterday.getTime();
    });

    if (todayCompletions.length > 0) {
      if (yesterdayCompletions.length > 0 || this.wellnessStreak === 0) {
        this.wellnessStreak += 1;
      }
    } else if (yesterdayCompletions.length === 0 && this.wellnessStreak > 0) {
      this.wellnessStreak = 0;
    }
  }

  // Achievement system
  private checkForAchievements(): void {
    const newAchievements: Achievement[] = [];

    // First assessment achievement
    if (this.assessmentHistory.length === 1 && !this.hasAchievement('first-assessment')) {
      newAchievements.push({
        id: 'first-assessment',
        title: 'Getting Started',
        description: 'Completed your first self-assessment',
        unlockedAt: new Date(),
        category: 'milestone'
      });
    }

    // Consistency achievements
    if (this.wellnessStreak === 3 && !this.hasAchievement('three-day-streak')) {
      newAchievements.push({
        id: 'three-day-streak',
        title: 'Building Habits',
        description: 'Completed wellness practices for 3 days in a row',
        unlockedAt: new Date(),
        category: 'consistency'
      });
    }

    if (this.wellnessStreak === 7 && !this.hasAchievement('week-streak')) {
      newAchievements.push({
        id: 'week-streak',
        title: 'Week Warrior',
        description: 'Maintained wellness practices for a full week',
        unlockedAt: new Date(),
        category: 'consistency'
      });
    }

    // Completion achievements
    if (this.completedRecommendations.length === 10 && !this.hasAchievement('ten-recommendations')) {
      newAchievements.push({
        id: 'ten-recommendations',
        title: 'Active Participant',
        description: 'Completed 10 recommendations',
        unlockedAt: new Date(),
        category: 'milestone'
      });
    }

    this.achievements.push(...newAchievements);
  }

  private hasAchievement(achievementId: string): boolean {
    return this.achievements.some(achievement => achievement.id === achievementId);
  }

  // Pattern identification
  addPattern(pattern: IdentifiedPattern): void {
    // Remove any existing pattern with the same ID
    this.patterns = this.patterns.filter(p => p.id !== pattern.id);
    this.patterns.push(pattern);
  }

  getActivePatterns(): IdentifiedPattern[] {
    // Return patterns identified in the last 30 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    return this.patterns.filter(pattern => pattern.firstObserved >= cutoffDate);
  }

  // Summary methods
  getProgressSummary(): {
    totalAssessments: number;
    totalRecommendations: number;
    currentStreak: number;
    totalAchievements: number;
    recentTrends: any;
  } {
    return {
      totalAssessments: this.assessmentHistory.length,
      totalRecommendations: this.completedRecommendations.length,
      currentStreak: this.wellnessStreak,
      totalAchievements: this.achievements.length,
      recentTrends: this.getAssessmentTrends()
    };
  }

  toJSON(): UserProgress {
    return {
      userId: this.userId,
      assessmentHistory: this.assessmentHistory,
      completedRecommendations: this.completedRecommendations,
      wellnessStreak: this.wellnessStreak,
      achievements: this.achievements,
      patterns: this.patterns
    };
  }
}