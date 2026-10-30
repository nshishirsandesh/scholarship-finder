import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApplicationStage, ApplicationTrackerItem, UserDocumentStatus, DocumentReadiness } from '../types/tracker';
import { useAuth } from './AuthContext';
import {
  loadSavedScholarshipIds,
  saveSavedScholarshipIds,
  loadTrackerItems,
  saveTrackerItems,
  loadUserDocuments,
  saveUserDocuments,
} from '../services/storageService';

interface TrackerContextType {
  savedScholarshipIds: string[];
  trackerItems: ApplicationTrackerItem[];
  userDocuments: UserDocumentStatus[];
  isSaved: (id: string) => boolean;
  toggleSaveScholarship: (id: string) => void;
  updateApplicationStage: (scholarshipId: string, stage: ApplicationStage, notes?: string, appNo?: string) => void;
  removeApplication: (scholarshipId: string) => void;
  updateDocumentStatus: (documentId: string, status: DocumentReadiness, notes?: string) => void;
  toggleReminder: (scholarshipId: string) => boolean;
  isReminderActive: (scholarshipId: string) => boolean;
  getReadinessPercentageForScholarship: (requiredDocIds: string[]) => { readyCount: number; totalCount: number; percentage: number };
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeUserId } = useAuth();
  const [savedScholarshipIds, setSavedScholarshipIds] = useState<string[]>([]);
  const [trackerItems, setTrackerItems] = useState<ApplicationTrackerItem[]>([]);
  const [userDocuments, setUserDocuments] = useState<UserDocumentStatus[]>([]);

  useEffect(() => {
    if (activeUserId) {
      setSavedScholarshipIds(loadSavedScholarshipIds(activeUserId));
      setTrackerItems(loadTrackerItems(activeUserId));
      setUserDocuments(loadUserDocuments(activeUserId));
    }
  }, [activeUserId]);

  const isSaved = (id: string) => savedScholarshipIds.includes(id);

  const toggleSaveScholarship = (id: string) => {
    let nextSaved: string[];
    if (savedScholarshipIds.includes(id)) {
      nextSaved = savedScholarshipIds.filter(item => item !== id);
    } else {
      nextSaved = [...savedScholarshipIds, id];
      // Automatically add to tracker in 'saved' stage if not already tracked
      if (!trackerItems.some(item => item.scholarshipId === id)) {
        const nextTracker = [
          ...trackerItems,
          {
            scholarshipId: id,
            stage: 'saved' as ApplicationStage,
            savedAt: new Date().toISOString(),
          },
        ];
        setTrackerItems(nextTracker);
        saveTrackerItems(activeUserId, nextTracker);
      }
    }
    setSavedScholarshipIds(nextSaved);
    saveSavedScholarshipIds(activeUserId, nextSaved);
  };

  const updateApplicationStage = (
    scholarshipId: string,
    stage: ApplicationStage,
    notes?: string,
    appNo?: string
  ) => {
    let exists = false;
    const updated = trackerItems.map(item => {
      if (item.scholarshipId === scholarshipId) {
        exists = true;
        return {
          ...item,
          stage,
          notes: notes !== undefined ? notes : item.notes,
          applicationNumber: appNo !== undefined ? appNo : item.applicationNumber,
          appliedDate: stage === 'applied' && !item.appliedDate ? new Date().toISOString() : item.appliedDate,
        };
      }
      return item;
    });

    if (!exists) {
      updated.push({
        scholarshipId,
        stage,
        savedAt: new Date().toISOString(),
        notes,
        applicationNumber: appNo,
        appliedDate: stage === 'applied' ? new Date().toISOString() : undefined,
      });
      if (!savedScholarshipIds.includes(scholarshipId)) {
        const nextSaved = [...savedScholarshipIds, scholarshipId];
        setSavedScholarshipIds(nextSaved);
        saveSavedScholarshipIds(activeUserId, nextSaved);
      }
    }

    setTrackerItems(updated);
    saveTrackerItems(activeUserId, updated);
  };

  const removeApplication = (scholarshipId: string) => {
    const updatedTracker = trackerItems.filter(item => item.scholarshipId !== scholarshipId);
    setTrackerItems(updatedTracker);
    saveTrackerItems(activeUserId, updatedTracker);

    const updatedSaved = savedScholarshipIds.filter(id => id !== scholarshipId);
    setSavedScholarshipIds(updatedSaved);
    saveSavedScholarshipIds(activeUserId, updatedSaved);
  };

  const updateDocumentStatus = (documentId: string, status: DocumentReadiness, notes?: string) => {
    const updated = userDocuments.map(doc => {
      if (doc.documentId === documentId) {
        return { ...doc, status, notes: notes !== undefined ? notes : doc.notes, updatedAt: new Date().toISOString() };
      }
      return doc;
    });
    setUserDocuments(updated);
    saveUserDocuments(activeUserId, updated);
  };

  const toggleReminder = (scholarshipId: string): boolean => {
    let nowActive = false;
    const updated = trackerItems.map(item => {
      if (item.scholarshipId === scholarshipId) {
        nowActive = !item.reminderEnabled;
        return { ...item, reminderEnabled: nowActive };
      }
      return item;
    });

    // If item wasn't in tracker yet, create it with reminder
    if (!trackerItems.some(i => i.scholarshipId === scholarshipId)) {
      nowActive = true;
      updated.push({
        scholarshipId,
        stage: 'saved',
        savedAt: new Date().toISOString(),
        reminderEnabled: true,
      });
      if (!savedScholarshipIds.includes(scholarshipId)) {
        const nextSaved = [...savedScholarshipIds, scholarshipId];
        setSavedScholarshipIds(nextSaved);
        saveSavedScholarshipIds(activeUserId, nextSaved);
      }
    }

    setTrackerItems(updated);
    saveTrackerItems(activeUserId, updated);
    return nowActive;
  };

  const isReminderActive = (scholarshipId: string) => {
    const found = trackerItems.find(item => item.scholarshipId === scholarshipId);
    return Boolean(found?.reminderEnabled);
  };

  const getReadinessPercentageForScholarship = (requiredDocIds: string[]) => {
    if (!requiredDocIds || requiredDocIds.length === 0) {
      return { readyCount: 0, totalCount: 0, percentage: 100 };
    }
    const readyCount = requiredDocIds.filter(id => {
      const doc = userDocuments.find(d => d.documentId === id);
      return doc?.status === 'ready';
    }).length;
    const totalCount = requiredDocIds.length;
    const percentage = Math.round((readyCount / totalCount) * 100);
    return { readyCount, totalCount, percentage };
  };

  return (
    <TrackerContext.Provider
      value={{
        savedScholarshipIds,
        trackerItems,
        userDocuments,
        isSaved,
        toggleSaveScholarship,
        updateApplicationStage,
        removeApplication,
        updateDocumentStatus,
        toggleReminder,
        isReminderActive,
        getReadinessPercentageForScholarship,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return context;
}
