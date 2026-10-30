import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, ConfirmationResult } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { DEMO_PERSONAS } from '../data/personas';
import { DemoPersona } from '../types/user';
import {
  initRecaptchaVerifier,
  sendOtpToPhone,
  verifyOtpCode,
  verifyDemoOtp,
  performSignOut,
} from '../services/authService';

interface AuthContextType {
  user: User | null;
  demoPersona: DemoPersona | null;
  isDemoMode: boolean;
  isAuthenticated: boolean;
  isFirebaseAvailable: boolean;
  activeUserId: string;
  setDemoPersona: (persona: DemoPersona | null) => void;
  toggleDemoMode: (enabled: boolean) => void;
  sendPhoneOtp: (phoneNumber: string, containerId: string) => Promise<ConfirmationResult | boolean>;
  confirmOtp: (otp: string, confirmationResult?: ConfirmationResult, phoneNumber?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [demoPersona, setDemoPersonaState] = useState<DemoPersona | null>(() => {
    const saved = localStorage.getItem('scholarship_finder_active_persona');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return null;
  });
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    // If Firebase is not configured, default isDemoMode to true
    if (!isFirebaseConfigured) return true;
    const pref = localStorage.getItem('scholarship_finder_demo_mode');
    return pref !== 'false';
  });

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, currentUser => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }
  }, []);

  const setDemoPersona = (persona: DemoPersona | null) => {
    setDemoPersonaState(persona);
    if (persona) {
      localStorage.setItem('scholarship_finder_active_persona', JSON.stringify(persona));
    } else {
      localStorage.removeItem('scholarship_finder_active_persona');
    }
  };

  const toggleDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    localStorage.setItem('scholarship_finder_demo_mode', String(enabled));
  };

  const sendPhoneOtp = async (phoneNumber: string, containerId: string) => {
    if (isDemoMode || !isFirebaseConfigured) {
      // Simulated instant OTP in demo mode
      return true;
    }
    const verifier = initRecaptchaVerifier(containerId);
    if (!verifier) {
      throw new Error('Failed to create reCAPTCHA verifier.');
    }
    return await sendOtpToPhone(phoneNumber, verifier);
  };

  const confirmOtp = async (
    otp: string,
    confirmationResult?: ConfirmationResult,
    phoneNumber?: string
  ) => {
    if (isDemoMode || !isFirebaseConfigured) {
      const persona = verifyDemoOtp(phoneNumber || '+91 99999 99999', otp);
      setDemoPersona(persona);
      return;
    }

    if (confirmationResult) {
      const firebaseUser = await verifyOtpCode(confirmationResult, otp);
      setUser(firebaseUser);
      setDemoPersona(null);
    } else {
      throw new Error('No active verification session found.');
    }
  };

  const logout = async () => {
    await performSignOut();
    setUser(null);
    setDemoPersona(null);
  };

  const isAuthenticated = Boolean(user || demoPersona);
  const activeUserId = user ? user.uid : (demoPersona ? demoPersona.id : 'guest_student');

  return (
    <AuthContext.Provider
      value={{
        user,
        demoPersona,
        isDemoMode,
        isAuthenticated,
        isFirebaseAvailable: isFirebaseConfigured,
        activeUserId,
        setDemoPersona,
        toggleDemoMode,
        sendPhoneOtp,
        confirmOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
