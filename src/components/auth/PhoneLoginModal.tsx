import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PERSONAS } from '../../data/personas';
import { Phone, KeyRound, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { ConfirmationResult } from 'firebase/auth';

interface PhoneLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PhoneLoginModal: React.FC<PhoneLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    isDemoMode,
    isFirebaseAvailable,
    setDemoPersona,
    sendPhoneOtp,
    confirmOtp,
  } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      if (isDemoMode || !isFirebaseAvailable) {
        // Fast verified test sign-in
        setTimeout(() => {
          setStep('otp');
          setOtpCode('123456');
          setIsLoading(false);
        }, 400);
        return;
      }

      // Real Firebase phone auth
      const result = await sendPhoneOtp(phoneNumber, 'recaptcha-container');
      if (typeof result !== 'boolean') {
        setConfirmationResult(result);
      }
      setStep('otp');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send SMS OTP. You can use standard OTP 123456.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await confirmOtp(otpCode, confirmationResult, phoneNumber);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPersona = (personaId: string) => {
    const persona = DEMO_PERSONAS.find(p => p.id === personaId);
    if (persona) {
      setDemoPersona(persona);
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Verification & Sign In"
      subtitle="Sign in via Mobile OTP or choose a sample student profile"
      maxWidth="md"
    >
      <div className="space-y-6 text-slate-900">
        {/* Quick Sample Student Profiles */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
            <span>Sample Student Profiles</span>
            <span className="text-[11px] text-emerald-700 font-semibold">1-Click Selection</span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            {DEMO_PERSONAS.map(p => (
              <button
                key={p.id}
                onClick={() => handleSelectPersona(p.id)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 group-hover:border-emerald-500"
                  />
                  <div>
                    <div className="font-semibold text-xs text-slate-900 group-hover:text-emerald-800">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{p.tagline}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transform group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Or Sign In With Phone
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Phone / OTP Form */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Indian Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Enter your registered mobile number for SMS OTP verification. Test verification code is <span className="font-mono font-semibold text-slate-700">123456</span>.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div id="recaptcha-container"></div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {isLoading ? 'Sending Code...' : 'Send Verification OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Enter 6-Digit SMS OTP
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  placeholder="123456"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 text-sm text-slate-900 text-center tracking-widest font-mono outline-none transition-colors"
                />
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-slate-500">Sent to {phoneNumber}</span>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-emerald-700 hover:underline font-semibold"
                >
                  Change Number
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP & Sign In'}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
};
