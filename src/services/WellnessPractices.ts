// Wellness practices library for ADHD and neurodivergent support

import { UserState, AccessibilityNeeds } from '../models/types.js';
import { Practice, PracticeSession, AccessibilityModification, Feedback } from './interfaces.js';

export class WellnessPractices {
  private practiceLibrary: Practice[];
  private sessionHistory: Map<string, PracticeSession[]> = new Map();

  constructor() {
    this.practiceLibrary = this.initializePractices();
  }

  suggestPractices(userState: UserState, timeAvailable: number): Practice[] {
    const suitablePractices = this.practiceLibrary.filter(practice => 
      practice.duration <= timeAvailable && 
      this.isPracticeAppropriate(practice, userState)
    );

    return this.rankPracticesByRelevance(suitablePractices, userState).slice(0, 3);
  }

  guidePractice(practice: Practice): PracticeSession {
    const session: PracticeSession = {
      practiceId: practice.id,
      startTime: new Date(),
      duration: practice.duration,
      completed: false
    };

    // Store session for tracking
    const sessions = this.sessionHistory.get(practice.id) || [];
    sessions.push(session);
    this.sessionHistory.set(practice.id, sessions);

    return session;
  }

  trackParticipation(session: PracticeSession): void {
    session.completed = true;
    // Update session in history
    const sessions = this.sessionHistory.get(session.practiceId) || [];
    const sessionIndex = sessions.findIndex(s => s.startTime === session.startTime);
    if (sessionIndex !== -1) {
      sessions[sessionIndex] = session;
      this.sessionHistory.set(session.practiceId, sessions);
    }
  }

  modifyForAccessibility(practice: Practice, needs: AccessibilityNeeds): Practice {
    const modifiedPractice = { ...practice };
    const modifications: AccessibilityModification[] = [];

    if (needs.reducedMotion) {
      modifications.push({
        type: 'motor',
        description: 'Reduced movement version',
        alternativeInstructions: practice.instructions.map(instruction => 
          instruction.replace(/move|stretch|walk/gi, 'gently adjust position or visualize movement')
        )
      });
    }

    if (needs.screenReader) {
      modifications.push({
        type: 'visual',
        description: 'Screen reader optimized',
        alternativeInstructions: practice.instructions.map(instruction =>
          `Audio cue: ${instruction}`
        )
      });
    }

    if (needs.highContrast) {
      modifications.push({
        type: 'visual',
        description: 'High contrast visual aids',
        alternativeInstructions: practice.instructions
      });
    }

    modifiedPractice.accessibilityModifications = [
      ...modifiedPractice.accessibilityModifications,
      ...modifications
    ];

    return modifiedPractice;
  }

  getPracticeHistory(practiceId: string): PracticeSession[] {
    return this.sessionHistory.get(practiceId) || [];
  }

  getCompletionRate(practiceId: string): number {
    const sessions = this.getPracticeHistory(practiceId);
    if (sessions.length === 0) return 0;
    
    const completed = sessions.filter(s => s.completed).length;
    return (completed / sessions.length) * 100;
  }

  private isPracticeAppropriate(practice: Practice, userState: UserState): boolean {
    // High energy practices for low energy states might not be appropriate
    if (userState.energyLevel === 'depleted' && practice.category === 'energy' && practice.difficulty === 'challenging') {
      return false;
    }

    // Breathing practices are good for high stress
    if (userState.stressLevel === 'overwhelming' && practice.category !== 'breathing' && practice.category !== 'grounding') {
      return false;
    }

    // Movement might be too much when focus is scattered
    if (userState.focusCapacity === 'scattered' && practice.category === 'movement' && practice.difficulty !== 'easy') {
      return false;
    }

    return true;
  }

  private rankPracticesByRelevance(practices: Practice[], userState: UserState): Practice[] {
    return practices.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, userState);
      const scoreB = this.calculateRelevanceScore(b, userState);
      return scoreB - scoreA;
    });
  }

  private calculateRelevanceScore(practice: Practice, userState: UserState): number {
    let score = 0;

    // Base score by category relevance
    switch (practice.category) {
      case 'breathing':
        if (userState.stressLevel === 'high' || userState.stressLevel === 'overwhelming') score += 5;
        break;
      case 'grounding':
        if (userState.stressLevel === 'overwhelming' || userState.focusCapacity === 'scattered') score += 4;
        break;
      case 'energy':
        if (userState.energyLevel === 'low' || userState.energyLevel === 'depleted') score += 4;
        break;
      case 'mindfulness':
        if (userState.currentMood === 'low' || userState.stressLevel === 'high') score += 3;
        break;
      case 'movement':
        if (userState.energyLevel === 'moderate' || userState.energyLevel === 'high') score += 3;
        break;
    }

    // Difficulty appropriateness
    if (userState.energyLevel === 'depleted' && practice.difficulty === 'easy') score += 2;
    if (userState.energyLevel === 'high' && practice.difficulty === 'challenging') score += 1;

    // Duration appropriateness
    if (userState.focusCapacity === 'scattered' && practice.duration <= 5) score += 2;
    if (userState.focusCapacity === 'focused' && practice.duration > 5) score += 1;

    // Historical effectiveness
    const completionRate = this.getCompletionRate(practice.id);
    score += completionRate / 20; // Add up to 5 points based on completion rate

    return score;
  }

  private initializePractices(): Practice[] {
    return [
      {
        id: 'box-breathing',
        name: '4-4-4-4 Box Breathing',
        description: 'A simple breathing technique to calm your nervous system',
        duration: 3,
        difficulty: 'easy',
        category: 'breathing',
        instructions: [
          'Sit comfortably with your back straight',
          'Breathe in through your nose for 4 counts',
          'Hold your breath for 4 counts',
          'Exhale through your mouth for 4 counts',
          'Hold empty for 4 counts',
          'Repeat 4-6 times'
        ],
        accessibilityModifications: []
      },
      {
        id: '478-breathing',
        name: '4-7-8 Calming Breath',
        description: 'A powerful breathing technique for anxiety and stress relief',
        duration: 4,
        difficulty: 'easy',
        category: 'breathing',
        instructions: [
          'Place the tip of your tongue behind your upper front teeth',
          'Exhale completely through your mouth',
          'Close your mouth and inhale through your nose for 4 counts',
          'Hold your breath for 7 counts',
          'Exhale through your mouth for 8 counts',
          'Repeat 3-4 times'
        ],
        accessibilityModifications: []
      },
      {
        id: '5-4-3-2-1-grounding',
        name: '5-4-3-2-1 Grounding',
        description: 'Use your senses to ground yourself in the present moment',
        duration: 5,
        difficulty: 'easy',
        category: 'grounding',
        instructions: [
          'Name 5 things you can see around you',
          'Name 4 things you can touch',
          'Name 3 things you can hear',
          'Name 2 things you can smell',
          'Name 1 thing you can taste',
          'Take three deep breaths'
        ],
        accessibilityModifications: []
      },
      {
        id: 'body-scan',
        name: 'Quick Body Scan',
        description: 'A brief mindfulness practice to connect with your body',
        duration: 8,
        difficulty: 'moderate',
        category: 'mindfulness',
        instructions: [
          'Lie down or sit comfortably',
          'Close your eyes or soften your gaze',
          'Start at the top of your head',
          'Notice any sensations without trying to change them',
          'Slowly move your attention down through your body',
          'Spend about 30 seconds on each major body part',
          'End by taking three deep breaths'
        ],
        accessibilityModifications: []
      },
      {
        id: 'energy-shake',
        name: 'Energy Release Shake',
        description: 'Shake out tension and boost your energy naturally',
        duration: 3,
        difficulty: 'easy',
        category: 'movement',
        instructions: [
          'Stand with feet hip-width apart',
          'Start by shaking your hands gently',
          'Add your arms, then shoulders',
          'Let the shaking move through your whole body',
          'Shake for 30 seconds, then pause and breathe',
          'Repeat 2-3 times',
          'End by standing still and noticing how you feel'
        ],
        accessibilityModifications: []
      },
      {
        id: 'gentle-stretch',
        name: 'Desk-Friendly Stretches',
        description: 'Simple stretches you can do anywhere to release tension',
        duration: 5,
        difficulty: 'easy',
        category: 'movement',
        instructions: [
          'Neck rolls: slowly roll your head in each direction',
          'Shoulder shrugs: lift shoulders to ears, hold, release',
          'Arm circles: make small circles forward and backward',
          'Spinal twist: gently twist your torso left and right',
          'Ankle rolls: lift feet and rotate ankles',
          'Deep breath and gentle forward fold'
        ],
        accessibilityModifications: []
      },
      {
        id: 'energy-visualization',
        name: 'Golden Light Energy Boost',
        description: 'Visualize warm, energizing light filling your body',
        duration: 6,
        difficulty: 'moderate',
        category: 'energy',
        instructions: [
          'Sit or lie down comfortably',
          'Close your eyes and take three deep breaths',
          'Imagine a warm, golden light above your head',
          'See this light slowly entering through the top of your head',
          'Feel it filling your entire body with warmth and energy',
          'Let the light dissolve any tiredness or heaviness',
          'Take three more deep breaths and slowly open your eyes'
        ],
        accessibilityModifications: []
      },
      {
        id: 'progressive-relaxation',
        name: 'Quick Progressive Muscle Relaxation',
        description: 'Tense and release muscle groups to reduce physical stress',
        duration: 10,
        difficulty: 'moderate',
        category: 'grounding',
        instructions: [
          'Start with your feet - tense for 5 seconds, then release',
          'Move to your calves - tense and release',
          'Continue with thighs, glutes, abdomen',
          'Tense your hands into fists, then release',
          'Tense your arms, shoulders, and neck',
          'Scrunch your face muscles, then release',
          'Take three deep breaths and notice the relaxation'
        ],
        accessibilityModifications: []
      }
    ];
  }
}