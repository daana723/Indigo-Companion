import { Question, QuestionType, UserResponse } from './types.js';

export class QuestionModel implements Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required: boolean;

  constructor(data: Partial<Question> = {}) {
    this.id = data.id || this.generateId();
    this.text = data.text || '';
    this.type = data.type || 'text';
    this.options = data.options;
    this.required = data.required ?? true;
  }

  private generateId(): string {
    return `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.text.trim()) {
      errors.push('Question text cannot be empty');
    }

    if (this.type === 'multiple-choice' && (!this.options || this.options.length < 2)) {
      errors.push('Multiple choice questions must have at least 2 options');
    }

    if (this.type === 'scale' && this.options && this.options.length !== 2) {
      errors.push('Scale questions should have exactly 2 options (min and max labels)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Factory methods for common question types
  static createMoodQuestion(): QuestionModel {
    return new QuestionModel({
      text: "How would you describe your mood right now?",
      type: 'multiple-choice',
      options: ['Very low', 'Low', 'Neutral', 'Good', 'Excellent'],
      required: true
    });
  }

  static createEnergyQuestion(): QuestionModel {
    return new QuestionModel({
      text: "What's your energy level like today?",
      type: 'multiple-choice',
      options: ['Depleted', 'Low', 'Moderate', 'High', 'Energized'],
      required: true
    });
  }

  static createFocusQuestion(): QuestionModel {
    return new QuestionModel({
      text: "How is your ability to focus right now?",
      type: 'multiple-choice',
      options: ['Very scattered', 'Unfocused', 'Moderate', 'Focused', 'Hyperfocused'],
      required: true
    });
  }

  static createStressQuestion(): QuestionModel {
    return new QuestionModel({
      text: "How would you rate your current stress level?",
      type: 'scale',
      options: ['Completely calm', 'Overwhelmed'],
      required: true
    });
  }

  static createChallengeQuestion(): QuestionModel {
    return new QuestionModel({
      text: "What's been your biggest challenge today?",
      type: 'text',
      required: false
    });
  }

  static createSupportQuestion(): QuestionModel {
    return new QuestionModel({
      text: "What kind of support would be most helpful right now?",
      type: 'multiple-choice',
      options: [
        'Encouragement and affirmations',
        'Focus techniques',
        'Calming practices',
        'Energy boosting activities',
        'Just someone to listen'
      ],
      required: false
    });
  }

  static createWellnessQuestion(): QuestionModel {
    return new QuestionModel({
      text: "Have you done any wellness practices today?",
      type: 'yes-no',
      required: false
    });
  }

  // Response validation for this question
  validateResponse(response: UserResponse): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.required && (response.answer === undefined || response.answer === null || response.answer === '')) {
      errors.push('This question requires an answer');
    }

    switch (this.type) {
      case 'multiple-choice':
        if (this.options && typeof response.answer === 'string') {
          if (!this.options.includes(response.answer)) {
            errors.push('Answer must be one of the provided options');
          }
        }
        break;

      case 'scale':
        if (typeof response.answer === 'number') {
          if (response.answer < 1 || response.answer > 10) {
            errors.push('Scale answer must be between 1 and 10');
          }
        } else {
          errors.push('Scale questions require a numeric answer');
        }
        break;

      case 'yes-no':
        if (typeof response.answer === 'string') {
          if (!['yes', 'no', 'true', 'false'].includes(response.answer.toLowerCase())) {
            errors.push('Yes/No questions require a yes or no answer');
          }
        }
        break;

      case 'text':
        if (typeof response.answer !== 'string') {
          errors.push('Text questions require a string answer');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON(): Question {
    return {
      id: this.id,
      text: this.text,
      type: this.type,
      options: this.options,
      required: this.required
    };
  }
}