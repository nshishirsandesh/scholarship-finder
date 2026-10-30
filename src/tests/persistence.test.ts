import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveUserProfile,
  loadUserProfile,
  exportUserDataAsJson,
  wipeAllUserData,
} from '../services/storageService';
import { DEMO_PERSONAS } from '../data/personas';
import { UserProfile } from '../types/user';

// Mock localStorage for Node test environment
const store: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    Object.keys(store).forEach(k => delete store[k]);
  },
  length: 0,
  key: (index: number) => Object.keys(store)[index] || null,
};

describe('Storage & Data Privacy Persistence', () => {
  const testUserId = 'test_student_123';
  const sampleProfile: UserProfile = {
    ...DEMO_PERSONAS[0].profile,
    uid: testUserId,
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads student profile accurately from storage', async () => {
    await saveUserProfile(testUserId, sampleProfile);
    const loaded = await loadUserProfile(testUserId);
    expect(loaded).toBeDefined();
    expect(loaded?.fullName).toBe(sampleProfile.fullName);
    expect(loaded?.academic.course).toBe(sampleProfile.academic.course);
  });

  it('exports structured JSON backup with required fields', async () => {
    await saveUserProfile(testUserId, sampleProfile);
    const jsonString = exportUserDataAsJson(testUserId);
    const parsed = JSON.parse(jsonString);

    expect(parsed.userId).toBe(testUserId);
    expect(parsed.profile).toBeDefined();
    expect(parsed.exportedAt).toBeDefined();
  });

  it('wipes all user data upon request', async () => {
    await saveUserProfile(testUserId, sampleProfile);
    await wipeAllUserData(testUserId);
    const afterWipe = await loadUserProfile(testUserId);
    expect(afterWipe).toBeNull();
  });
});
