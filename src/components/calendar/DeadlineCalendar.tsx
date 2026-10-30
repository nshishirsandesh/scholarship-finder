import React, { useState } from 'react';
import { SCHOLARSHIPS_DATA } from '../../data/scholarships';
import { useTracker } from '../../context/TrackerContext';
import { useToast } from '../common/Toast';
import { DeadlineBadge, VerifiedSourceBadge } from '../common/Badge';
import {
  Calendar as CalendarIcon,
  Bell,
  BellRing,
  Download,
  ExternalLink,
} from 'lucide-react';

export const DeadlineCalendar: React.FC = () => {
  const { toggleReminder, isReminderActive } = useTracker();
  const { showToast } = useToast();
  const [filterMonth, setFilterMonth] = useState<string>('ALL');

  // Filter scholarships with deadlines
  const sorted = [...SCHOLARSHIPS_DATA].sort((a, b) => {
    const dateA = a.deadline.closingDate ? new Date(a.deadline.closingDate).getTime() : 9999999999999;
    const dateB = b.deadline.closingDate ? new Date(b.deadline.closingDate).getTime() : 9999999999999;
    return dateA - dateB;
  });

  const filtered = sorted.filter(s => {
    if (filterMonth === 'ALL') return true;
    if (!s.deadline.closingDate) return false;
    const month = (new Date(s.deadline.closingDate).getMonth() + 1).toString().padStart(2, '0');
    return month === filterMonth;
  });

  const handleToggleReminder = (scholarshipId: string, name: string) => {
    const active = toggleReminder(scholarshipId);
    if (active) {
      showToast(`In-app deadline reminder enabled for ${name}!`, 'success');
    } else {
      showToast(`Reminder removed for ${name}`, 'info');
    }
  };

  const generateIcsFile = (scholarship: typeof SCHOLARSHIPS_DATA[0]) => {
    if (!scholarship.deadline.closingDate) return;
    const dateStr = scholarship.deadline.closingDate.replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Scholarship Finder India//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Deadline: ${scholarship.name}`,
      `DESCRIPTION:Official Portal: ${scholarship.source.officialUrl}\\nAward: ${scholarship.awardAmount.formatted}`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${dateStr}`,
      `URL:${scholarship.source.officialUrl}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${scholarship.id}-deadline.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded .ics calendar event file', 'success');
  };

  const getGoogleCalendarUrl = (scholarship: typeof SCHOLARSHIPS_DATA[0]) => {
    if (!scholarship.deadline.closingDate) return '#';
    const dateStr = scholarship.deadline.closingDate.replace(/-/g, '');
    const title = encodeURIComponent(`Scholarship Deadline: ${scholarship.name}`);
    const details = encodeURIComponent(
      `Award: ${scholarship.awardAmount.formatted}\nPortal: ${scholarship.source.officialUrl}`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${dateStr}&details=${details}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Timelines & Schedule Management
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
              Scholarship Deadlines & Reminders Calendar
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Stay ahead of portal closings. Set in-app alerts, download calendar events, and track annual government cycles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Month Filter:</span>
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 outline-none focus:border-emerald-600 focus:bg-white transition-colors"
            >
              <option value="ALL">All Months</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deadlines List */}
      <div className="space-y-3">
        {filtered.map(s => {
          const isReminder = isReminderActive(s.id);
          const hasFixed = s.deadline.type === 'fixed' && s.deadline.closingDate;
          const portalDestination = s.source.applicationUrl && s.source.isApplicationUrlVerified
            ? s.source.applicationUrl
            : s.source.officialUrl;

          return (
            <div
              key={s.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 transition-colors shadow-2xs"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{s.name}</h3>
                  <VerifiedSourceBadge lastVerifiedDate={s.source.lastVerifiedDate} />
                  <DeadlineBadge
                    type={s.deadline.type}
                    closingDate={s.deadline.closingDate}
                    status={s.deadline.status}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="text-emerald-700 font-bold font-mono">
                    {s.awardAmount.formatted}
                  </span>
                  <span>•</span>
                  <span>{s.provider}</span>
                  <span>•</span>
                  <span className="text-slate-500">{s.deadline.cycleDescription}</span>
                </div>
              </div>

              {/* Actions Right */}
              <div className="flex items-center gap-2 shrink-0">
                {/* In-app reminder toggle */}
                <button
                  onClick={() => handleToggleReminder(s.id, s.name)}
                  className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                    isReminder
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                  title={isReminder ? 'Reminder Enabled' : 'Enable in-app reminder'}
                >
                  {isReminder ? <BellRing className="w-4 h-4 animate-bounce text-emerald-700" /> : <Bell className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isReminder ? 'Reminding' : 'Remind Me'}</span>
                </button>

                {hasFixed && (
                  <>
                    <button
                      onClick={() => generateIcsFile(s)}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                      title="Download .ics Calendar File"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <a
                      href={getGoogleCalendarUrl(s)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                      title="Add to Google Calendar"
                    >
                      <CalendarIcon className="w-4 h-4" />
                    </a>
                  </>
                )}

                <a
                  href={portalDestination}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-emerald-700 transition-colors"
                  title="Open Portal"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
