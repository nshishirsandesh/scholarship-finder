import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { UserProfile } from '../types/user';
import { ApplicationTrackerItem, UserDocumentStatus } from '../types/tracker';
import { INDIAN_DOCUMENTS_TAXONOMY } from '../data/documentsTaxonomy';

const STORAGE_KEYS = {
  PROFILE: 'scholarship_finder_profile',
  TRACKER: 'scholarship_finder_tracker',
  DOCUMENTS: 'scholarship_finder_documents',
  SAVED_IDS: 'scholarship_finder_saved_ids',
  REMINDERS: 'scholarship_finder_reminders',
};

export async function saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
  // Always save locally for instant responsiveness
  localStorage.setItem(`${STORAGE_KEYS.PROFILE}_${userId}`, JSON.stringify(profile));
  localStorage.setItem('scholarship_finder_active_profile_id', userId);
  localStorage.setItem('scholarship_finder_last_active_profile', JSON.stringify(profile));

  // Sync to Firestore if configured
  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { profile, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Firestore profile sync failed, relying on local storage:', e);
    }
  }
}

export async function loadUserProfile(userId: string): Promise<UserProfile | null> {
  // First check local
  const localData = localStorage.getItem(`${STORAGE_KEYS.PROFILE}_${userId}`);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      console.error('Error parsing local profile data:', e);
    }
  }

  // Fallback to active saved profile if exists and matches userId
  const activeProfileId = localStorage.getItem('scholarship_finder_active_profile_id');
  if (activeProfileId === userId) {
    const activeProfileJson = localStorage.getItem('scholarship_finder_last_active_profile');
    if (activeProfileJson) {
      try {
        return JSON.parse(activeProfileJson);
      } catch {}
    }
  }

  // Then check Firestore
  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.profile) {
          localStorage.setItem(`${STORAGE_KEYS.PROFILE}_${userId}`, JSON.stringify(data.profile));
          return data.profile as UserProfile;
        }
      }
    } catch (e) {
      console.warn('Firestore load failed:', e);
    }
  }

  return null;
}

export function loadTrackerItems(userId: string): ApplicationTrackerItem[] {
  const data = localStorage.getItem(`${STORAGE_KEYS.TRACKER}_${userId}`);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveTrackerItems(userId: string, items: ApplicationTrackerItem[]): void {
  localStorage.setItem(`${STORAGE_KEYS.TRACKER}_${userId}`, JSON.stringify(items));
  if (isFirebaseConfigured && db) {
    const userRef = doc(db, 'users', userId, 'tracker', 'pipeline');
    setDoc(userRef, { items, updatedAt: new Date().toISOString() }).catch(err => {
      console.warn('Firestore tracker sync error:', err);
    });
  }
}

export function loadUserDocuments(userId: string): UserDocumentStatus[] {
  const data = localStorage.getItem(`${STORAGE_KEYS.DOCUMENTS}_${userId}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {}
  }

  // Seed default document statuses from taxonomy
  const initialDocs: UserDocumentStatus[] = INDIAN_DOCUMENTS_TAXONOMY.map(tax => ({
    documentId: tax.id,
    name: tax.name,
    status: tax.id === 'aadhaar_card' || tax.id === 'marksheet_10' ? 'ready' : 'not_started',
    issuingAuthority: tax.issuingAuthority,
    updatedAt: new Date().toISOString(),
  }));
  localStorage.setItem(`${STORAGE_KEYS.DOCUMENTS}_${userId}`, JSON.stringify(initialDocs));
  return initialDocs;
}

export function saveUserDocuments(userId: string, docs: UserDocumentStatus[]): void {
  localStorage.setItem(`${STORAGE_KEYS.DOCUMENTS}_${userId}`, JSON.stringify(docs));
  if (isFirebaseConfigured && db) {
    const userRef = doc(db, 'users', userId, 'documents', 'status');
    setDoc(userRef, { docs, updatedAt: new Date().toISOString() }).catch(err => {
      console.warn('Firestore documents sync error:', err);
    });
  }
}

export function loadSavedScholarshipIds(userId: string): string[] {
  const data = localStorage.getItem(`${STORAGE_KEYS.SAVED_IDS}_${userId}`);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveSavedScholarshipIds(userId: string, ids: string[]): void {
  localStorage.setItem(`${STORAGE_KEYS.SAVED_IDS}_${userId}`, JSON.stringify(ids));
}

export function exportUserDataAsJson(userId: string): string {
  const profile = localStorage.getItem(`${STORAGE_KEYS.PROFILE}_${userId}`);
  const tracker = localStorage.getItem(`${STORAGE_KEYS.TRACKER}_${userId}`);
  const docs = localStorage.getItem(`${STORAGE_KEYS.DOCUMENTS}_${userId}`);
  const saved = localStorage.getItem(`${STORAGE_KEYS.SAVED_IDS}_${userId}`);

  const payload = {
    exportedAt: new Date().toISOString(),
    userId,
    profile: profile ? JSON.parse(profile) : null,
    tracker: tracker ? JSON.parse(tracker) : [],
    documents: docs ? JSON.parse(docs) : [],
    savedScholarships: saved ? JSON.parse(saved) : [],
  };

  return JSON.stringify(payload, null, 2);
}

export async function wipeAllUserData(userId: string): Promise<void> {
  localStorage.removeItem(`${STORAGE_KEYS.PROFILE}_${userId}`);
  localStorage.removeItem(`${STORAGE_KEYS.TRACKER}_${userId}`);
  localStorage.removeItem(`${STORAGE_KEYS.DOCUMENTS}_${userId}`);
  localStorage.removeItem(`${STORAGE_KEYS.SAVED_IDS}_${userId}`);

  if (localStorage.getItem('scholarship_finder_active_profile_id') === userId) {
    localStorage.removeItem('scholarship_finder_active_profile_id');
    localStorage.removeItem('scholarship_finder_last_active_profile');
  }

  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
    } catch (e) {
      console.warn('Firestore wipe failed:', e);
    }
  }
}
