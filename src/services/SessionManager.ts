import { LocalStorageService } from './LocalStorageManager.js';
import { UserStateModel } from '../models/UserState.js';
import { UserProgressModel } from '../models/UserProgress.js';

export interface SessionData {
  userId: string;
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  userState: UserStateModel;
  userProgress: UserProgressModel;
  currentAssessment?: any;
  pendingRecommendations: any[];
  sessionSettings: SessionSettings;
}

export interface SessionSettings {
  autoSave: boolean;
  autoSaveInterval: number; // milliseconds
  sessionTimeout: number; // milliseconds
  offlineMode: boolean;
}

export class SessionManager {
  private currentSession: SessionData | null = null;
  private storageService: LocalStorageService;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private sessionTimeoutTimer: NodeJS.Timeout | null = null;
  private isOnline: boolean = navigator.onLine;
  private pendingSync: any[] = [];

  constructor() {
    this.storageService = new LocalStorageService();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseSession();
      } else {
        this.resumeSession();
      }
    });

    // Before page unload
    window.addEventListener('beforeunload', () => {
      this.saveSession();
    });

    // Periodic activity tracking
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.updateLastActivity(), { passive: true });
    });
  }

  async startSession(userId: string, settings?: Partial<SessionSettings>): Promise<SessionData> {
    try {
      // End any existing session
      if (this.currentSession) {
        await this.endSession();
      }

      // Load user data
      const userData = await this.storageService.retrieveUserData(userId);
      
      // Create new session
      const sessionId = this.generateSessionId();
      const defaultSettings: SessionSettings = {
        autoSave: true,
        autoSaveInterval: 30000, // 30 seconds
        sessionTimeout: 1800000, // 30 minutes
        offlineMode: !this.isOnline
      };

      this.currentSession = {
        userId,
        sessionId,
        startTime: new Date(),
        lastActivity: new Date(),
        userState: new UserStateModel(userData?.userState),
        userProgress: new UserProgressModel(userData?.userProgress),
        pendingRecommendations: userData?.pendingRecommendations || [],
        sessionSettings: { ...defaultSettings, ...settings }
      };

      // Start auto-save if enabled
      if (this.currentSession.sessionSettings.autoSave) {
        this.startAutoSave();
      }

      // Start session timeout
      this.startSessionTimeout();

      // Save initial session state
      await this.saveSession();

      return this.currentSession;
    } catch (error) {
      console.error('Error starting session:', error);
      throw new Error('Failed to start session');
    }
  }

  async endSession(): Promise<void> {
    try {
      if (!this.currentSession) {
        return;
      }

      // Save final session state
      await this.saveSession();

      // Clear timers
      this.stopAutoSave();
      this.stopSessionTimeout();

      // Clear session data
      this.currentSession = null;
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  async saveSession(): Promise<void> {
    try {
      if (!this.currentSession) {
        return;
      }

      const sessionData = {
        userState: this.currentSession.userState.toJSON(),
        userProgress: this.currentSession.userProgress.toJSON(),
        pendingRecommendations: this.currentSession.pendingRecommendations,
        sessionInfo: {
          sessionId: this.currentSession.sessionId,
          startTime: this.currentSession.startTime,
          lastActivity: this.currentSession.lastActivity,
          settings: this.currentSession.sessionSettings
        }
      };

      if (this.isOnline) {
        await this.storageService.storeUserData(this.currentSession.userId, sessionData);
      } else {
        // Store in pending sync queue for offline mode
        this.pendingSync.push({
          userId: this.currentSession.userId,
          data: sessionData,
          timestamp: new Date()
        });
        
        // Also save to local storage as backup
        await this.storageService.storeUserData(this.currentSession.userId, sessionData);
      }
    } catch (error) {
      console.error('Error saving session:', error);
      // Don't throw error to avoid disrupting user experience
    }
  }

  async loadSession(userId: string): Promise<SessionData | null> {
    try {
      const userData = await this.storageService.retrieveUserData(userId);
      
      if (!userData || !userData.sessionInfo) {
        return null;
      }

      // Restore session data
      this.currentSession = {
        userId,
        sessionId: userData.sessionInfo.sessionId,
        startTime: new Date(userData.sessionInfo.startTime),
        lastActivity: new Date(userData.sessionInfo.lastActivity),
        userState: new UserStateModel(userData.userState),
        userProgress: new UserProgressModel(userData.userProgress),
        pendingRecommendations: userData.pendingRecommendations || [],
        sessionSettings: userData.sessionInfo.settings
      };

      // Check if session has expired
      const now = new Date();
      const timeSinceLastActivity = now.getTime() - this.currentSession.lastActivity.getTime();
      
      if (timeSinceLastActivity > this.currentSession.sessionSettings.sessionTimeout) {
        // Session expired, start fresh
        await this.endSession();
        return null;
      }

      // Resume session timers
      if (this.currentSession.sessionSettings.autoSave) {
        this.startAutoSave();
      }
      this.startSessionTimeout();

      return this.currentSession;
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  }

  getCurrentSession(): SessionData | null {
    return this.currentSession;
  }

  updateUserState(updates: Partial<UserStateModel>): void {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    Object.assign(this.currentSession.userState, updates);
    this.updateLastActivity();
  }

  updateUserProgress(updates: Partial<UserProgressModel>): void {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    Object.assign(this.currentSession.userProgress, updates);
    this.updateLastActivity();
  }

  addPendingRecommendation(recommendation: any): void {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    this.currentSession.pendingRecommendations.push(recommendation);
    this.updateLastActivity();
  }

  removePendingRecommendation(recommendationId: string): void {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    this.currentSession.pendingRecommendations = this.currentSession.pendingRecommendations
      .filter(rec => rec.id !== recommendationId);
    this.updateLastActivity();
  }

  private updateLastActivity(): void {
    if (this.currentSession) {
      this.currentSession.lastActivity = new Date();
      
      // Reset session timeout
      this.stopSessionTimeout();
      this.startSessionTimeout();
    }
  }

  private pauseSession(): void {
    this.stopAutoSave();
    this.saveSession(); // Save before pausing
  }

  private resumeSession(): void {
    if (this.currentSession && this.currentSession.sessionSettings.autoSave) {
      this.startAutoSave();
    }
    this.updateLastActivity();
  }

  private startAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    if (this.currentSession) {
      this.autoSaveTimer = setInterval(() => {
        this.saveSession();
      }, this.currentSession.sessionSettings.autoSaveInterval);
    }
  }

  private stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  private startSessionTimeout(): void {
    if (this.sessionTimeoutTimer) {
      clearTimeout(this.sessionTimeoutTimer);
    }

    if (this.currentSession) {
      this.sessionTimeoutTimer = setTimeout(() => {
        this.handleSessionTimeout();
      }, this.currentSession.sessionSettings.sessionTimeout);
    }
  }

  private stopSessionTimeout(): void {
    if (this.sessionTimeoutTimer) {
      clearTimeout(this.sessionTimeoutTimer);
      this.sessionTimeoutTimer = null;
    }
  }

  private async handleSessionTimeout(): Promise<void> {
    console.log('Session timed out due to inactivity');
    await this.endSession();
    
    // Emit custom event for UI to handle
    window.dispatchEvent(new CustomEvent('sessionTimeout'));
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async syncPendingData(): Promise<void> {
    if (this.pendingSync.length === 0) {
      return;
    }

    try {
      for (const item of this.pendingSync) {
        await this.storageService.storeUserData(item.userId, item.data);
      }
      
      // Clear pending sync queue
      this.pendingSync = [];
      console.log('Successfully synced pending data');
    } catch (error) {
      console.error('Error syncing pending data:', error);
    }
  }

  // Conflict resolution for offline/online sync
  async resolveDataConflicts(localData: any, remoteData: any): Promise<any> {
    // Simple last-write-wins strategy
    // In a more sophisticated system, you might want to merge changes
    const localTimestamp = new Date(localData.sessionInfo?.lastActivity || 0);
    const remoteTimestamp = new Date(remoteData.sessionInfo?.lastActivity || 0);

    if (localTimestamp > remoteTimestamp) {
      return localData;
    } else {
      return remoteData;
    }
  }

  // Session analytics
  getSessionAnalytics(): {
    duration: number;
    activityCount: number;
    isActive: boolean;
    timeUntilTimeout: number;
  } {
    if (!this.currentSession) {
      return {
        duration: 0,
        activityCount: 0,
        isActive: false,
        timeUntilTimeout: 0
      };
    }

    const now = new Date();
    const duration = now.getTime() - this.currentSession.startTime.getTime();
    const timeSinceActivity = now.getTime() - this.currentSession.lastActivity.getTime();
    const timeUntilTimeout = Math.max(0, 
      this.currentSession.sessionSettings.sessionTimeout - timeSinceActivity
    );

    return {
      duration,
      activityCount: 1, // Simplified - in real implementation, track actual activity
      isActive: timeUntilTimeout > 0,
      timeUntilTimeout
    };
  }
}