import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/user';
import { useAuth } from './AuthContext';
import { loadUserProfile, saveUserProfile } from '../services/storageService';
import { SCHOLARSHIPS_DATA } from '../data/scholarships';
import { evaluateProfileUpdateImpact, ProfileUpdateImpact } from '../engine/gapDetector';

interface UserProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  updateProfile: (updated: UserProfile) => Promise<ProfileUpdateImpact>;
  saveOnboarding: (newProfile: UserProfile) => Promise<void>;
  resetProfile: () => void;
  lastUpdateImpact: ProfileUpdateImpact | null;
  clearUpdateImpact: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeUserId, demoPersona } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdateImpact, setLastUpdateImpact] = useState<ProfileUpdateImpact | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      // If demo persona is selected, load or initialize from persona
      if (demoPersona) {
        const stored = await loadUserProfile(demoPersona.id);
        if (stored) {
          if (isMounted) setProfile(stored);
        } else {
          const initial: UserProfile = {
            ...demoPersona.profile,
            uid: demoPersona.id,
            updatedAt: new Date().toISOString(),
          };
          await saveUserProfile(demoPersona.id, initial);
          if (isMounted) setProfile(initial);
        }
      } else if (activeUserId) {
        const stored = await loadUserProfile(activeUserId);
        if (isMounted) setProfile(stored);
      }
      if (isMounted) setIsLoading(false);
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeUserId, demoPersona]);

  const updateProfile = async (updated: UserProfile): Promise<ProfileUpdateImpact> => {
    const prev = profile;
    const impact = evaluateProfileUpdateImpact(prev, updated, SCHOLARSHIPS_DATA);
    setProfile(updated);
    setLastUpdateImpact(impact);
    await saveUserProfile(activeUserId, updated);
    return impact;
  };

  const saveOnboarding = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    await saveUserProfile(activeUserId, newProfile);
  };

  const resetProfile = () => {
    setProfile(null);
  };

  const clearUpdateImpact = () => {
    setLastUpdateImpact(null);
  };

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        isLoading,
        updateProfile,
        saveOnboarding,
        resetProfile,
        lastUpdateImpact,
        clearUpdateImpact,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
