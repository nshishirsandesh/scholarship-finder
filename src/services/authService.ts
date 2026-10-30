import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut,
  User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import { DEMO_PERSONAS } from '../data/personas';
import { DemoPersona, UserProfile } from '../types/user';

export interface AuthState {
  user: User | null;
  demoUser: DemoPersona | null;
  isDemoMode: boolean;
  isAuthenticated: boolean;
}

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export function initRecaptchaVerifier(containerId: string): RecaptchaVerifier | null {
  if (!isFirebaseConfigured || !auth) {
    return null;
  }

  try {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA expired');
      },
    });
    window.recaptchaVerifier = verifier;
    return verifier;
  } catch (error) {
    console.error('Failed to initialize RecaptchaVerifier:', error);
    return null;
  }
}

export async function sendOtpToPhone(
  phoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Use Demo Login instead.');
  }
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
  window.confirmationResult = confirmationResult;
  return confirmationResult;
}

export async function verifyOtpCode(
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<User> {
  const result = await confirmationResult.confirm(otpCode);
  return result.user;
}

export function verifyDemoOtp(phoneNumber: string, otp: string): DemoPersona {
  const cleanPhone = phoneNumber.replace(/\s+/g, '');
  // Accepts 123456 as standard test OTP
  if (otp !== '123456') {
    throw new Error('Invalid Demo OTP. For demo mode, enter 123456.');
  }

  // Find persona or return default Ananya
  const persona = DEMO_PERSONAS.find(p => p.profile.phoneNumber?.replace(/\s+/g, '') === cleanPhone) || DEMO_PERSONAS[0];
  return persona;
}

export async function performSignOut(): Promise<void> {
  if (auth && auth.currentUser) {
    await signOut(auth);
  }
  localStorage.removeItem('scholarship_finder_active_persona');
}
