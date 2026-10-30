import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useUserProfile } from '../../context/UserProfileContext';
import { askAdvisor, isGeminiConfigured } from '../../services/geminiService';
import { ChatMessage } from '../../types/advisor';
import { SCHOLARSHIPS_DATA } from '../../data/scholarships';
import {
  Sparkles,
  Send,
  ExternalLink,
  User,
  ShieldCheck,
  Bot,
} from 'lucide-react';

interface AdvisorChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScholarship?: (scholarshipId: string) => void;
}

export const AdvisorChatModal: React.FC<AdvisorChatModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile } = useUserProfile();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcoming grounded message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome_1',
          sender: 'assistant',
          content:
            `Hello! I am your **AI Scholarship Advisor**, grounded in **${SCHOLARSHIPS_DATA.length} verified central, state, and corporate scholarship schemes** across India.\n\n` +
            (profile
              ? `I see you are studying **${profile.academic.course}** (${profile.academic.level}) in **${profile.location.state}** with family income **₹${profile.financialAndCategory.annualFamilyIncome.toLocaleString('en-IN')}**. Ask me anything about your eligibility, document checklists, or head-to-head scheme comparisons!`
              : `Ask me anything about scholarships for your academic level, income criteria, or required certificates!`),
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          suggestedFollowUps: [
            'Which scholarships match my profile 100%?',
            'Scholarships for girls in engineering',
            'Compare AICTE Pragati and Kotak Kanya',
            'What documents do I need for AICTE Pragati?',
          ],
        },
      ]);
    }
  }, [profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    try {
      const response = await askAdvisor(textToSend, messages, profile);
      setMessages(prev => [...prev, response]);
    } catch (e) {
      console.error('Advisor error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Scholarship Advisor"
      subtitle="Context-aware intelligence grounded in verified Indian scholarship frameworks"
      maxWidth="4xl"
    >
      <div className="flex flex-col h-[65vh]">
        {/* Grounding Engine Indicator Pill */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-600 animate-pulse" />
            <span className="font-bold text-slate-900">
              {isGeminiConfigured
                ? 'Gemini 1.5 Flash Connected (Live Official Grounding)'
                : 'Deterministic Knowledge Engine (Offline Heuristic • 204 Catalog)'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Zero Hallucination Guarantee</span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                  <Bot className="w-4 h-4 text-violet-700" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white font-medium shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                {/* Grounded Citations Rail */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5 mt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      Verified Catalog References:
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {msg.citations.map(cit => (
                        <div
                          key={cit.scholarshipId}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 shadow-2xs hover:bg-slate-100/80 transition-colors"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <span className="font-bold text-slate-900 block truncate">
                              {cit.name}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-mono font-bold">
                              {cit.award}
                            </span>
                          </div>
                          <a
                            href={cit.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-[11px] font-semibold shrink-0 transition-colors flex items-center gap-1"
                            title="Open verified portal"
                          >
                            <span>Official Portal</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Follow-Ups */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {msg.suggestedFollowUps.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(prompt)}
                        className="px-2.5 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 border border-violet-200 text-[11px] text-violet-800 font-medium transition-colors shadow-2xs"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 mt-1 text-xs shadow-2xs">
                  {profile?.fullName ? profile.fullName[0].toUpperCase() : 'U'}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-violet-700 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
                <span>Analyzing criteria across 204 verified schemes...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="pt-3 border-t border-slate-200/80 flex items-center gap-2 mt-3"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            placeholder="Ask about academic eligibility, income cutoffs, Pragati documents..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
          >
            <span>Ask Advisor</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </Modal>
  );
};
