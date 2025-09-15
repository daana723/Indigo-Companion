// Unit tests for storage and session management

import { LocalStorageService } from '../services/LocalStorageManager.js';
import { SessionManager } from '../services/SessionManager.js';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
})();

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// LocalStorageService Tests
describe('LocalStorageService', () => {
  let storageService: LocalStorageService;
  const testUserId = 'test_user_123';

  beforeEach(() => {
    storageService = new LocalStorageService();
    localStorageMock.clear();
  });

  test('should store and retrieve user data', async () => {
    const testData = {
      userState: {
        currentMood: 'good',
        energyLevel: 'high'
      },
      preferences: {
        theme: 'dark'
      }
    };

    await storageService.storeUserData(testUserId, testData);
    const retrievedData = await storageService.retrieveUserData(testUserId);

    expect(retrievedData.userState.currentMood).toBe('good');
    expect(retrievedData.preferences.theme).toBe('dark');
    expect(retrievedData._metadata).toBeTruthy();
  });

  test('should handle sensitive data encryption', () => {
    const sensitiveData = {
      personalInfo: {
        email: 'test@example.com',
        phone: '123-456-7890'
      }
    };

    const encrypted = storageService.encryptSensitiveData(sensitiveData);
    expect(encrypted).toBeTruthy();
    expect(encrypted).not.toContain('test@example.com');

    const decrypted = storageService.decryptSensitiveData(encrypted);
    expect(decrypted.personalInfo.email).toBe('test@example.com');
  });

  test('should export user data correctly', async () => {
    const testData = {
      userState: { currentMood: 'excellent' },
      assessments: [{ id: '1', type: 'daily-checkin' }]
    };

    await storageService.storeUserData(testUserId, testData);
    const exportedData = await storageService.exportUserData(testUserId);

    const parsed = JSON.parse(exportedData);
    expect(parsed.userId).toBe(testUserId);
    expect(parsed.data.userState.currentMood).toBe('excellent');
    expect(parsed.exportedAt).toBeTruthy();
  });

  test('should delete user data completely', async () => {
    const testData = { userState: { currentMood: 'good' } };

    await storageService.storeUserData(testUserId, testData);
    expect(await storageService.retrieveUserData(testUserId)).toBeTruthy();

    await storageService.deleteUserData(testUserId);
    expect(await storageService.retrieveUserData(testUserId)).toBeNull();
  });

  test('should provide storage info', async () => {
    const testData = { userState: { currentMood: 'good' } };
    await storageService.storeUserData(testUserId, testData);

    const info = await storageService.getStorageInfo(testUserId);
    expect(info.hasData).toBe(true);
    expect(info.lastUpdated).toBeTruthy();
    expect(info.dataSize).toBeGreaterThan(0);
  });

  test('should import user data', async () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      userId: testUserId,
      data: {
        userState: { currentMood: 'imported' }
      },
      version: '1.0'
    };

    await storageService.importUserData(testUserId, JSON.stringify(exportData));
    const retrievedData = await storageService.retrieveUserData(testUserId);

    expect(retrievedData.userState.currentMood).toBe('imported');
  });
});

// SessionManager Tests
describe('SessionManager', () => {
  let sessionManager: SessionManager;
  const testUserId = 'test_user_456';

  beforeEach(() => {
    sessionManager = new SessionManager();
    localStorageMock.clear();
  });

  afterEach(async () => {
    // Clean up any active sessions
    const currentSession = sessionManager.getCurrentSession();
    if (currentSession) {
      await sessionManager.endSession();
    }
  });

  test('should start a new session', async () => {
    const session = await sessionManager.startSession(testUserId);

    expect(session.userId).toBe(testUserId);
    expect(session.sessionId).toBeTruthy();
    expect(session.startTime).toBeInstanceOf(Date);
    expect(session.userState).toBeTruthy();
    expect(session.userProgress).toBeTruthy();
  });

  test('should save and load session', async () => {
    const session = await sessionManager.startSession(testUserId);
    const originalSessionId = session.sessionId;

    // Modify session data
    sessionManager.updateUserState({ currentMood: 'excellent' });
    await sessionManager.saveSession();

    // End and reload session
    await sessionManager.endSession();
    const loadedSession = await sessionManager.loadSession(testUserId);

    expect(loadedSession).toBeTruthy();
    expect(loadedSession!.sessionId).toBe(originalSessionId);
    expect(loadedSession!.userState.currentMood).toBe('excellent');
  });

  test('should handle session timeout', async () => {
    const shortTimeoutSettings = {
      sessionTimeout: 100 // 100ms for testing
    };

    await sessionManager.startSession(testUserId, shortTimeoutSettings);

    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 150));

    // Session should be null after timeout
    expect(sessionManager.getCurrentSession()).toBeNull();
  });

  test('should manage pending recommendations', async () => {
    await sessionManager.startSession(testUserId);

    const recommendation = {
      id: 'rec_1',
      title: 'Test Recommendation',
      type: 'focus-technique'
    };

    sessionManager.addPendingRecommendation(recommendation);
    
    const session = sessionManager.getCurrentSession();
    expect(session!.pendingRecommendations).toHaveLength(1);
    expect(session!.pendingRecommendations[0].id).toBe('rec_1');

    sessionManager.removePendingRecommendation('rec_1');
    expect(session!.pendingRecommendations).toHaveLength(0);
  });

  test('should provide session analytics', async () => {
    await sessionManager.startSession(testUserId);

    const analytics = sessionManager.getSessionAnalytics();
    expect(analytics.duration).toBeGreaterThan(0);
    expect(analytics.isActive).toBe(true);
    expect(analytics.timeUntilTimeout).toBeGreaterThan(0);
  });

  test('should handle offline mode', async () => {
    // Mock offline state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });

    const session = await sessionManager.startSession(testUserId);
    expect(session.sessionSettings.offlineMode).toBe(true);

    // Simulate going online
    Object.defineProperty(navigator, 'onLine', {
      value: true
    });
    
    // Trigger online event
    window.dispatchEvent(new Event('online'));
  });
});

// Mock test framework functions
function describe(name: string, fn: () => void) {
  console.log(`\n--- ${name} ---`);
  fn();
}

function test(name: string, fn: () => void | Promise<void>) {
  return new Promise<void>(async (resolve) => {
    try {
      await fn();
      console.log(`✓ ${name}`);
      resolve();
    } catch (error) {
      console.log(`✗ ${name}: ${error}`);
      resolve();
    }
  });
}

function beforeEach(fn: () => void) {
  // In a real test framework, this would run before each test
  fn();
}

function afterEach(fn: () => void | Promise<void>) {
  // In a real test framework, this would run after each test
  return fn();
}

function expect(actual: any) {
  return {
    toBe: (expected: any) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toEqual: (expected: any) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toBeTruthy: () => {
      if (!actual) {
        throw new Error(`Expected truthy value, got ${actual}`);
      }
    },
    toBeNull: () => {
      if (actual !== null) {
        throw new Error(`Expected null, got ${actual}`);
      }
    },
    toBeInstanceOf: (constructor: any) => {
      if (!(actual instanceof constructor)) {
        throw new Error(`Expected instance of ${constructor.name}, got ${typeof actual}`);
      }
    },
    toHaveLength: (length: number) => {
      if (!actual || actual.length !== length) {
        throw new Error(`Expected length ${length}, got ${actual ? actual.length : 'undefined'}`);
      }
    },
    toBeGreaterThan: (value: number) => {
      if (actual <= value) {
        throw new Error(`Expected ${actual} to be greater than ${value}`);
      }
    },
    toContain: (item: any) => {
      if (!actual || !actual.includes(item)) {
        throw new Error(`Expected array to contain ${item}`);
      }
    },
    not: {
      toContain: (item: any) => {
        if (actual && actual.includes(item)) {
          throw new Error(`Expected array not to contain ${item}`);
        }
      }
    }
  };
}