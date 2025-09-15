import { Assessment, IdentifiedPattern, UserResponse, Question } from '../models/types.js';

export interface TrendData {
  metric: string;
  values: number[];
  timestamps: Date[];
  trend: 'improving' | 'declining' | 'stable' | 'cyclical';
  confidence: number;
  slope: number;
  correlation: number;
}

export interface PatternInsight