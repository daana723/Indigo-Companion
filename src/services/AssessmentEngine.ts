import { AssessmentEngine, AssessmentState } from './interfaces.js';
import { 
  Assessment, 
  AssessmentType, 
  UserResponse, 
  UserState, 
  PersonalizedSummary,
  Question,
  QuestionType 
} from '../models/types.js';
import { AssessmentModel } from '../models/Assessment.js';
import { QuestionModel } from '../models/Question.js';
import { UserResponseModel } from '../models/UserResponse.js';

export class AssessmentEngineService implements AssessmentEngine {
  private questionBank: Map<AssessmentType, Question[]> = new Map();
  private adaptiveQuestions: Map<string, Question[]> = new Map();

  constructor() {
    this.initializeQuestionBank();
  }

  private initializeQuestionBank(): void {
    // Daily Check-in Questions
    const dailyCheckinQuestions = [
      QuestionModel.createMoodQuestion(),
      QuestionModel.createEnergyQuestion(),
      QuestionModel.createFocusQuestion(),
      QuestionModel.createStressQuestion(),
      new QuestionModel({
        text: "How well did you sleep last night?",
        type: 'multiple-choice',
        options: ['Very poorly', 'Poorly', 'Okay', 'Well', 'Very well'],
        required: true
      }),
      new QuestionModel({
        text: "What's your main goal for today?",
        type: 'text',
        required: false
      }),
      QuestionModel.createChallengeQuestion(),
      QuestionModel.createSupportQuestion()
    ];

    // Mood Assessment Questions
    const moodAssessmentQuestions = [
      QuestionModel.createMoodQuestion(),
      new QuestionModel({
        text: "How long have you been feeling this way?",
        type: 'multiple-choice',
        options: ['Just now', 'A few hours', 'Today', 'A few days', 'A week or more'],
        required: true
      }),
      new QuestionModel({
        text: "What might be contributing to your current mood?",
        type: 'multiple-choice',
        options: [
          'Work/school stress',
          'Relationship issues',
          'Health concerns',
          'Financial worries',
          'Seasonal changes',
          'Medication changes',
          'Sleep issues',
          'Not sure'
        ],
        required: false
      }),
      new QuestionModel({
        text: "On a scale of 1-10, how much is your mood affecting your daily activities?",
        type: 'scale',
        options: ['Not at all', 'Completely'],
        required: true
      }),
      new QuestionModel({
        text: "What usually helps improve your mood?",
        type: 'text',
        required: false
      })
    ];

    // Focus Evaluation Questions
    const focusEvaluationQuestions = [
      QuestionModel.createFocusQuestion(),
      new QuestionModel({
        text: "What's making it hard to focus right now?",
        type: 'multiple-choice',
        options: [
          'Too many distractions',
          'Feeling overwhelmed',
          'Lack of interest',
          'Physical discomfort',
          'Emotional state',
          'Environment issues',
          'Task is too difficult',
          'Task is too easy'
        ],
        required: false
      }),
      new QuestionModel({
        text: "How long can you typically focus on one task?",
        type: 'multiple-choice',
        options: ['Less than 5 minutes', '5-15 minutes', '15-30 minutes', '30-60 minutes', 'More than an hour'],
        required: true
      }),
      new QuestionModel({
        text: "What time of day do you focus best?",
        type: 'multiple-choice',
        options: ['Early morning', 'Late morning', 'Afternoon', 'Evening', 'Late night', 'It varies'],
        required: false
      }),
      new QuestionModel({
        text: "What focus techniques have you tried before?",
        type: 'text',
        required: false
      })
    ];

    // Wellness Review Questions
    const wellnessReviewQuestions = [
      QuestionModel.createWellnessQuestion(),
      new QuestionModel({
        text: "How would you rate your overall well-being this week?",
        type: 'scale',
        options: ['Very poor', 'Excellent'],
        required: true
      }),
      new QuestionModel({
        text: "Which wellness practices appeal to you most?",
        type: 'multiple-choice',
        options: [
          'Breathing exercises',
          'Meditation',
          'Physical movement',
          'Journaling',
          'Nature activities',
          'Creative activities',
          'Social connection',
          'Rest and relaxation'
        ],
        required: false
      }),
      new QuestionModel({
        text: "What barriers prevent you from practicing wellness?",
        type: 'multiple-choice',
        options: [
          'Lack of time',
          'Don\'t know where to start',
          'Forget to do it',
          'Don\'t see the benefits',
          'Too overwhelming',
          'Physical limitations',
          'No barriers'
        ],
        required: false
      }),
      new QuestionModel({
        text: "How much time can you realistically dedicate to wellness daily?",
        type: 'multiple-choice',
        options: ['1-2 minutes', '3-5 minutes', '5-10 minutes', '10-20 minutes', '20+ minutes'],
        required: true
      })
    ];

    this.questionBank.set('daily-checkin', dailyCheckinQuestions);
    this.questionBank.set('mood-assessment', moodAssessmentQuestions);
    this.questionBank.set('focus-evaluation', focusEvaluationQuestions);
    this.questionBank.set('wellness-review', wellnessReviewQuestions);
  }

  initiateAssessment(type: AssessmentType): Assessment {
    const questions = this.selectQuestionsForAssessment(type);
    
    return new AssessmentModel({
      type,
      questions,
      timestamp: new Date()
    });
  }

  private selectQuestionsForAssessment(type: AssessmentType, userState?: UserState): Question[] {
    const baseQuestions = this.questionBank.get(type) || [];
    
    // For now, return all base questions
    // In a more sophisticated system, we'd select based on user state and history
    return [...baseQuestions];
  }

  processResponse(response: UserResponse): AssessmentState {
    // This would typically be called with the current assessment context
    // For now, we'll create a basic implementation
    
    const validation = new UserResponseModel(response).validate();
    if (!validation.isValid) {
      throw new Error(`Invalid response: ${validation.errors.join(', ')}`);
    }

    // Return basic state - in real implementation, this would track progress
    return {
      currentQuestion: 0,
      totalQuestions: 1,
      responses: [response],
      isComplete: false
    };
  }

  generateSummary(assessment: Assessment): PersonalizedSummary {
    const responses = assessment.responses;
    const insights: string[] = [];
    const priorityAreas: string[] = [];
    const strengths: string[] = [];

    // Analyze mood responses
    const moodResponse = this.findResponseByQuestionText(responses, assessment.questions, 'mood');
    if (moodResponse) {
      const moodValue = this.getMoodValue(moodResponse.answer as string);
      if (moodValue <= 2) {
        insights.push("You're experiencing some challenging emotions right now.");
        priorityAreas.push("Emotional support and mood enhancement");
      } else if (moodValue >= 4) {
        insights.push("You're in a positive emotional space today.");
        strengths.push("Good emotional awareness and positive mood");
      }
    }

    // Analyze energy responses
    const energyResponse = this.findResponseByQuestionText(responses, assessment.questions, 'energy');
    if (energyResponse) {
      const energyValue = this.getEnergyValue(energyResponse.answer as string);
      if (energyValue <= 2) {
        insights.push("Your energy levels seem low today.");
        priorityAreas.push("Energy management and restoration");
      } else if (energyValue >= 4) {
        insights.push("You have good energy levels today.");
        strengths.push("Strong energy and vitality");
      }
    }

    // Analyze focus responses
    const focusResponse = this.findResponseByQuestionText(responses, assessment.questions, 'focus');
    if (focusResponse) {
      const focusValue = this.getFocusValue(focusResponse.answer as string);
      if (focusValue <= 2) {
        insights.push("Focus and concentration are challenging right now.");
        priorityAreas.push("Focus enhancement and attention management");
      } else if (focusValue >= 4) {
        insights.push("Your focus and concentration are strong today.");
        strengths.push("Good attention and concentration abilities");
      }
    }

    // Analyze stress responses
    const stressResponse = this.findResponseByQuestionText(responses, assessment.questions, 'stress');
    if (stressResponse) {
      const stressValue = typeof stressResponse.answer === 'number' ? 
        stressResponse.answer : this.getStressValue(stressResponse.answer as string);
      
      if (stressValue >= 7) {
        insights.push("You're experiencing significant stress right now.");
        priorityAreas.push("Stress reduction and relaxation");
      } else if (stressValue <= 3) {
        insights.push("You're managing stress well today.");
        strengths.push("Good stress management and emotional regulation");
      }
    }

    // Generate overall state description
    let overallState = "You're navigating your day with awareness and intention.";
    
    if (priorityAreas.length > strengths.length) {
      overallState = "You're facing some challenges today, and that's completely okay. Let's focus on gentle support.";
    } else if (strengths.length > priorityAreas.length) {
      overallState = "You're in a good space today with several areas of strength to celebrate.";
    }

    // Ensure we have at least some content
    if (insights.length === 0) {
      insights.push("Thank you for taking time to check in with yourself.");
    }

    if (strengths.length === 0) {
      strengths.push("Your willingness to self-reflect and seek support");
    }

    return {
      overallState,
      keyInsights: insights,
      priorityAreas: priorityAreas,
      strengths: strengths
    };
  }

  identifyPatterns(history: Assessment[]): any[] {
    // Basic pattern identification
    const patterns: any[] = [];

    if (history.length < 3) {
      return patterns; // Need at least 3 assessments for patterns
    }

    // Analyze mood patterns
    const moodTrend = this.analyzeTrend(history, 'mood');
    if (moodTrend.trend !== 'stable') {
      patterns.push({
        id: `mood_${moodTrend.trend}`,
        description: `Your mood has been ${moodTrend.trend} over recent assessments`,
        confidence: moodTrend.confidence,
        suggestions: this.getMoodSuggestions(moodTrend.trend),
        firstObserved: new Date()
      });
    }

    // Analyze energy patterns
    const energyTrend = this.analyzeTrend(history, 'energy');
    if (energyTrend.trend !== 'stable') {
      patterns.push({
        id: `energy_${energyTrend.trend}`,
        description: `Your energy levels have been ${energyTrend.trend} recently`,
        confidence: energyTrend.confidence,
        suggestions: this.getEnergySuggestions(energyTrend.trend),
        firstObserved: new Date()
      });
    }

    return patterns;
  }

  // Helper methods
  private findResponseByQuestionText(responses: UserResponse[], questions: Question[], keyword: string): UserResponse | undefined {
    const question = questions.find(q => q.text.toLowerCase().includes(keyword));
    return question ? responses.find(r => r.questionId === question.id) : undefined;
  }

  private getMoodValue(moodAnswer: string): number {
    const moodMap: { [key: string]: number } = {
      'very low': 1, 'very-low': 1,
      'low': 2,
      'neutral': 3, 'okay': 3,
      'good': 4,
      'excellent': 5, 'very good': 5
    };
    
    return moodMap[moodAnswer.toLowerCase()] || 3;
  }

  private getEnergyValue(energyAnswer: string): number {
    const energyMap: { [key: string]: number } = {
      'depleted': 1,
      'low': 2,
      'moderate': 3,
      'high': 4,
      'energized': 5
    };
    
    return energyMap[energyAnswer.toLowerCase()] || 3;
  }

  private getFocusValue(focusAnswer: string): number {
    const focusMap: { [key: string]: number } = {
      'very scattered': 1, 'scattered': 1,
      'unfocused': 2,
      'moderate': 3,
      'focused': 4,
      'hyperfocused': 3 // Hyperfocus can be challenging
    };
    
    return focusMap[focusAnswer.toLowerCase()] || 3;
  }

  private getStressValue(stressAnswer: string): number {
    const stressMap: { [key: string]: number } = {
      'calm': 1, 'completely calm': 1,
      'mild': 3,
      'moderate': 5,
      'high': 7,
      'overwhelming': 10, 'overwhelmed': 10
    };
    
    return stressMap[stressAnswer.toLowerCase()] || 5;
  }

  private analyzeTrend(history: Assessment[], metric: string): {
    trend: 'improving' | 'declining' | 'stable';
    confidence: number;
  } {
    // Simple trend analysis - compare first half to second half
    const midpoint = Math.floor(history.length / 2);
    const earlier = history.slice(0, midpoint);
    const later = history.slice(midpoint);

    const earlierAvg = this.getAverageMetric(earlier, metric);
    const laterAvg = this.getAverageMetric(later, metric);

    const difference = laterAvg - earlierAvg;
    const threshold = 0.5;

    let trend: 'improving' | 'declining' | 'stable';
    if (difference > threshold) {
      trend = 'improving';
    } else if (difference < -threshold) {
      trend = 'declining';
    } else {
      trend = 'stable';
    }

    const confidence = Math.min(0.9, Math.abs(difference) / 2); // Simple confidence calculation

    return { trend, confidence };
  }

  private getAverageMetric(assessments: Assessment[], metric: string): number {
    // This is a simplified implementation
    // In reality, you'd extract the specific metric values from assessment responses
    return 3; // Placeholder
  }

  private getMoodSuggestions(trend: string): string[] {
    if (trend === 'declining') {
      return [
        'Consider mood-boosting activities like gentle exercise or creative pursuits',
        'Reach out to supportive friends or family',
        'Practice self-compassion and remember that difficult periods are temporary'
      ];
    } else if (trend === 'improving') {
      return [
        'Continue the practices that are supporting your positive mood',
        'Consider what factors are contributing to this improvement',
        'Share your positive energy with others when you feel able'
      ];
    }
    return [];
  }

  private getEnergySuggestions(trend: string): string[] {
    if (trend === 'declining') {
      return [
        'Focus on sleep hygiene and consistent sleep schedule',
        'Consider gentle movement or stretching',
        'Review your nutrition and hydration habits'
      ];
    } else if (trend === 'improving') {
      return [
        'Maintain the habits that are boosting your energy',
        'Consider gradually increasing activity levels',
        'Use this energy for activities that bring you joy'
      ];
    }
    return [];
  }
}