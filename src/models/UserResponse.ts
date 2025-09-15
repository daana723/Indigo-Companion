import { UserResponse } from './types.js';

export class UserResponseModel implements UserResponse {
  questionId: string;
  answer: string | number | string[];
  timestamp: Date;

  constructor(data: Partial<UserResponse> = {}) {
    this.questionId = data.questionId || '';
    this.answer = data.answer ?? '';
    this.timestamp = data.timestamp || new Date();
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.questionId || typeof this.questionId !== 'string') {
      errors.push('Response must have a valid question ID');
    }

    if (this.answer === undefined || this.answer === null) {
      errors.push('Response must have an answer');
    }

    if (!this.timestamp || !(this.timestamp instanceof Date)) {
      errors.push('Response must have a valid timestamp');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper methods for different answer types
  getStringAnswer(): string {
    if (typeof this.answer === 'string') {
      return this.answer;
    }
    if (typeof this.answer === 'number') {
      return this.answer.toString();
    }
    if (Array.isArray(this.answer)) {
      return this.answer.join(', ');
    }
    return '';
  }

  getNumericAnswer(): number | null {
    if (typeof this.answer === 'number') {
      return this.answer;
    }
    if (typeof this.answer === 'string') {
      const parsed = parseFloat(this.answer);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  getBooleanAnswer(): boolean | null {
    if (typeof this.answer === 'string') {
      const lower = this.answer.toLowerCase();
      if (['yes', 'true', '1'].includes(lower)) return true;
      if (['no', 'false', '0'].includes(lower)) return false;
    }
    if (typeof this.answer === 'number') {
      return this.answer > 0;
    }
    return null;
  }

  getArrayAnswer(): string[] {
    if (Array.isArray(this.answer)) {
      return this.answer;
    }
    if (typeof this.answer === 'string') {
      return this.answer.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    return [];
  }

  // Factory methods for common response types
  static createTextResponse(questionId: string, text: string): UserResponseModel {
    return new UserResponseModel({
      questionId,
      answer: text,
      timestamp: new Date()
    });
  }

  static createScaleResponse(questionId: string, value: number): UserResponseModel {
    return new UserResponseModel({
      questionId,
      answer: Math.max(1, Math.min(10, value)), // Clamp between 1-10
      timestamp: new Date()
    });
  }

  static createMultipleChoiceResponse(questionId: string, choice: string): UserResponseModel {
    return new UserResponseModel({
      questionId,
      answer: choice,
      timestamp: new Date()
    });
  }

  static createYesNoResponse(questionId: string, answer: boolean): UserResponseModel {
    return new UserResponseModel({
      questionId,
      answer: answer ? 'yes' : 'no',
      timestamp: new Date()
    });
  }

  static createMultiSelectResponse(questionId: string, selections: string[]): UserResponseModel {
    return new UserResponseModel({
      questionId,
      answer: selections,
      timestamp: new Date()
    });
  }

  toJSON(): UserResponse {
    return {
      questionId: this.questionId,
      answer: this.answer,
      timestamp: this.timestamp
    };
  }
}