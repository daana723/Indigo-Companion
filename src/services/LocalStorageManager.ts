import { LocalStorageManager } from './interfaces.js';

export class LocalStorageService implements LocalStorageManager {
  private readonly storagePrefix = 'adhd_companion_';
  private readonly encryptionKey = 'user_data_key'; // In production, this should be more secure

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    // Check if localStorage is available
    if (!this.isLocalStorageAvailable()) {
      console.warn('LocalStorage is not available. Data will not persist.');
    }
  }

  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  private getStorageKey(userId: string, dataType: string): string {
    return `${this.storagePrefix}${userId}_${dataType}`;
  }

  async storeUserData(userId: string, data: any): Promise<void> {
    try {
      if (!this.isLocalStorageAvailable()) {
        throw new Error('LocalStorage is not available');
      }

      // Separate sensitive and non-sensitive data
      const { sensitiveData, regularData } = this.separateData(data);

      // Store regular data as-is
      if (Object.keys(regularData).length > 0) {
        const regularKey = this.getStorageKey(userId, 'regular');
        localStorage.setItem(regularKey, JSON.stringify(regularData));
      }

      // Encrypt and store sensitive data
      if (Object.keys(sensitiveData).length > 0) {
        const encryptedData = this.encryptSensitiveData(sensitiveData);
        const sensitiveKey = this.getStorageKey(userId, 'sensitive');
        localStorage.setItem(sensitiveKey, encryptedData);
      }

      // Store metadata
      const metadata = {
        lastUpdated: new Date().toISOString(),
        version: '1.0',
        userId: userId
      };
      const metaKey = this.getStorageKey(userId, 'meta');
      localStorage.setItem(metaKey, JSON.stringify(metadata));

    } catch (error) {
      console.error('Error storing user data:', error);
      throw new Error('Failed to store user data');
    }
  }

  async retrieveUserData(userId: string): Promise<any> {
    try {
      if (!this.isLocalStorageAvailable()) {
        return null;
      }

      // Retrieve regular data
      const regularKey = this.getStorageKey(userId, 'regular');
      const regularDataStr = localStorage.getItem(regularKey);
      const regularData = regularDataStr ? JSON.parse(regularDataStr) : {};

      // Retrieve and decrypt sensitive data
      const sensitiveKey = this.getStorageKey(userId, 'sensitive');
      const encryptedDataStr = localStorage.getItem(sensitiveKey);
      const sensitiveData = encryptedDataStr ? 
        this.decryptSensitiveData(encryptedDataStr) : {};

      // Retrieve metadata
      const metaKey = this.getStorageKey(userId, 'meta');
      const metadataStr = localStorage.getItem(metaKey);
      const metadata = metadataStr ? JSON.parse(metadataStr) : null;

      // Combine all data
      const combinedData = {
        ...regularData,
        ...sensitiveData,
        _metadata: metadata
      };

      return Object.keys(combinedData).length > 1 ? combinedData : null;

    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  async exportUserData(userId: string): Promise<string> {
    try {
      const userData = await this.retrieveUserData(userId);
      
      if (!userData) {
        throw new Error('No user data found');
      }

      // Remove metadata from export
      const { _metadata, ...exportData } = userData;

      // Create export object with timestamp
      const exportObject = {
        exportedAt: new Date().toISOString(),
        userId: userId,
        data: exportData,
        version: '1.0'
      };

      return JSON.stringify(exportObject, null, 2);

    } catch (error) {
      console.error('Error exporting user data:', error);
      throw new Error('Failed to export user data');
    }
  }

  async deleteUserData(userId: string): Promise<void> {
    try {
      if (!this.isLocalStorageAvailable()) {
        return;
      }

      // Delete all data types for this user
      const dataTypes = ['regular', 'sensitive', 'meta'];
      
      dataTypes.forEach(type => {
        const key = this.getStorageKey(userId, type);
        localStorage.removeItem(key);
      });

      // Also clean up any legacy keys that might exist
      this.cleanupLegacyKeys(userId);

    } catch (error) {
      console.error('Error deleting user data:', error);
      throw new Error('Failed to delete user data');
    }
  }

  encryptSensitiveData(data: any): string {
    try {
      // Simple encryption for demo purposes
      // In production, use a proper encryption library like crypto-js
      const jsonString = JSON.stringify(data);
      const encoded = btoa(jsonString);
      
      // Add a simple XOR cipher for basic obfuscation
      let encrypted = '';
      for (let i = 0; i < encoded.length; i++) {
        encrypted += String.fromCharCode(
          encoded.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
        );
      }
      
      return btoa(encrypted);
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  decryptSensitiveData(encryptedData: string): any {
    try {
      // Reverse the encryption process
      const encrypted = atob(encryptedData);
      
      let decrypted = '';
      for (let i = 0; i < encrypted.length; i++) {
        decrypted += String.fromCharCode(
          encrypted.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
        );
      }
      
      const jsonString = atob(decrypted);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error decrypting data:', error);
      return {};
    }
  }

  // Helper methods
  private separateData(data: any): { sensitiveData: any; regularData: any } {
    const sensitiveFields = [
      'personalInfo',
      'medicalInfo', 
      'emergencyContacts',
      'privateNotes',
      'assessmentResponses' // Assessment responses might contain sensitive info
    ];

    const sensitiveData: any = {};
    const regularData: any = {};

    Object.keys(data).forEach(key => {
      if (sensitiveFields.includes(key) || this.isSensitiveField(key, data[key])) {
        sensitiveData[key] = data[key];
      } else {
        regularData[key] = data[key];
      }
    });

    return { sensitiveData, regularData };
  }

  private isSensitiveField(key: string, value: any): boolean {
    // Additional logic to detect sensitive data
    const sensitiveKeywords = ['password', 'email', 'phone', 'address', 'ssn', 'medical'];
    const keyLower = key.toLowerCase();
    
    return sensitiveKeywords.some(keyword => keyLower.includes(keyword));
  }

  private cleanupLegacyKeys(userId: string): void {
    try {
      // Clean up any old storage keys that might exist
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix) && key.includes(userId)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error cleaning up legacy keys:', error);
    }
  }

  // Utility methods for storage management
  async getStorageInfo(userId: string): Promise<{
    hasData: boolean;
    lastUpdated: string | null;
    dataSize: number;
    version: string | null;
  }> {
    try {
      const userData = await this.retrieveUserData(userId);
      
      if (!userData || !userData._metadata) {
        return {
          hasData: false,
          lastUpdated: null,
          dataSize: 0,
          version: null
        };
      }

      // Calculate approximate data size
      const dataStr = JSON.stringify(userData);
      const dataSize = new Blob([dataStr]).size;

      return {
        hasData: true,
        lastUpdated: userData._metadata.lastUpdated,
        dataSize: dataSize,
        version: userData._metadata.version
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        hasData: false,
        lastUpdated: null,
        dataSize: 0,
        version: null
      };
    }
  }

  async clearAllData(): Promise<void> {
    try {
      if (!this.isLocalStorageAvailable()) {
        return;
      }

      // Find and remove all keys with our prefix
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw new Error('Failed to clear all data');
    }
  }

  async importUserData(userId: string, exportedData: string): Promise<void> {
    try {
      const importObject = JSON.parse(exportedData);
      
      // Validate import structure
      if (!importObject.data || !importObject.userId || !importObject.version) {
        throw new Error('Invalid export data format');
      }

      // Store the imported data
      await this.storeUserData(userId, importObject.data);
    } catch (error) {
      console.error('Error importing user data:', error);
      throw new Error('Failed to import user data');
    }
  }
}