import { 
  Assessment, 
  AssessmentType, 
  Question, 
  UserResponse, 
  PersonalizedSummary,
  Recommendation,
  QuestionType 
} from './types.js';

export class AssessmentModel implements Assessment {
  id: string;
  timestamp: Date;
  type: AssessmentType;
  questions: Question[];
  responses: UserResponse[];
  summary: PersonalizedSummary;
  recommendedActions: Recommendation[];

  constructor(data: Partial<Assessment> = {}) {
    this.id = data.id || this.generateId();
    this.timestamp = data.timestamp || new Date();
    this.type = data.type || 'daily-checkin';
    this.questions = data.questions || [];
    this.responses = data.responses || [];
    this.summary = data.summary || this.getEmptySummary();
    this.recommendedActions = data.recommendedActions || [];
  }

  private generateId(): string {
    return `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getEmptySummary(): PersonalizedSummary {
    return {
      overallState: '',
      keyInsights: [],
      priorityAreas: [],
      strengths: []
    };
  }

  // Validation methods
  static isValidAssessmentType(type: string): type is AssessmentType {
    return ['daily-checkin', 'mood-assessment', 'focus-evaluation', 'wellness-review'].includes(type);
  }

  static isValidQuestionType(type: string): type is QuestionType {
    return ['multiple-choice', 'scale', 'text', 'yes-no'].includes(type);
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.id || typeof this.id !== 'string') {
      errors.push('Assessment must have a valid ID');
    }

    if (!this.timestamp || !(this.timestamp instanceof Date)) {
      errors.push('Assessment must have a valid timestamp');
    }

    if (!AssessmentModel.isValidAssessmentType(this.type)) {
      errors.push('Invalid assessment type');
    }

    if (!Array.isArray(this.questions)) {
      errors.push('Questions must be an array');
    } else {
      this.questions.forEach((question, index) => {
        const questionErrors = this.validateQuestion(question);
        if (questionErrors.length > 0) {
          errors.push(`Question ${index + 1}: ${questionErrors.join(', ')}`);
        }
      });
    }

    if (!Array.isArray(this.responses)) {
      errors.push('Responses must be an array');
    } else {
      this.responses.forEach((response, index) => {
        const responseErrors = this.validateResponse(response);
        if (responseErrors.length > 0) {
          errors.push(`Response ${index + 1}: ${responseErrors.join(', ')}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateQuestion(question: Question): string[] {
    const errors: string[] = [];

    if (!question.id || typeof question.id !== 'string') {
      errors.push('Question must have a valid ID');
    }

    if (!question.text || typeof question.text !== 'string') {
      errors.push('Question must have valid text');
    }

    if (!AssessmentModel.isValidQuestionType(question.type)) {
      errors.push('Invalid question type');
    }

    if (typeof question.required !== 'boolean') {
      errors.push('Question required field must be boolean');
    }

    if (question.type === 'multiple-choice' && (!question.options || !Array.isArray(question.options))) {
      errors.push('Multiple choice questions must have options array');
    }

    return errors;
  }

  private validateResponse(response: UserResponse): string[] {
    const errors: string[] = [];

    if (!response.questionId || typeof response.questionId !== 'string') {
      errors.push('Response must have a valid question ID');
    }

    if (response.answer === undefined || response.answer === null) {
      errors.push('Response must have an answer');
    }

    if (!response.timestamp || !(response.timestamp instanceof Date)) {
      errors.push('Response must have a valid timestamp');
    }

    return errors;
  }

  // Assessment progress methods
  getProgress(): { completed: number; total: number; percentage: number } {
    const total = this.questions.length;
    const completed = this.responses.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }

  isComplete(): boolean {
    const requiredQuestions = this.questions.filter(q => q.required);
    const answeredRequiredQuestions = requiredQuestions.filter(q => 
      this.responses.some(r => r.questionId === q.id)
    );

    return answeredRequiredQuestions.length === requiredQuestions.length;
  }

  addResponse(response: UserResponse): void {
    // Remove any existing response for this question
    this.responses = this.responses.filter(r => r.questionId !== response.questionId);
    
    // Add the new response
    this.responses.push(response);
  }

  getResponseForQuestion(questionId: string): UserResponse | undefined {
    return this.responses.find(r => r.questionId === questionId);
  }

  // Analysis methods
  getAverageResponseTime(): number {
    if (this.responses.length < 2) return 0;

    const times: number[] = [];
    for (let i = 1; i < this.responses.length; i++) {
      const timeDiff = this.responses[i].timestamp.getTime() - this.responses[i-1].timestamp.getTime();
      times.push(timeDiff);
    }

    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getScaleResponses(): { questionId: string; value: number }[] {
    return this.responses
      .filter(r => typeof r.answer === 'number')
      .map(r => ({ questionId: r.questionId, value: r.answer as number }));
  }

  toJSON(): Assessment {
    return {
      id: this.id,
      timestamp: this.timestamp,
      type: this.type,
      questions: this.questions,
      responses: this.responses,
      summary: this.summary,
      recommendedActions: this.recommendedActions
    };
  }
}