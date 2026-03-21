'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface DateTimePickerProps {
  label: string;
  date: string;
  onDateChange: (date: string) => void;
  time?: string;
  onTimeChange?: (time: string) => void;
  showTime?: boolean;
  required?: boolean;
  error?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAY_FULL_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 22; h++) {
  for (let m = 0; m < 60; m += 15) {
    const hour = h.toString().padStart(2, '0');
    const min = m.toString().padStart(2, '0');
    TIME_OPTIONS.push(`${hour}:${min}`);
  }
}

function formatTime12(time24: string): string {
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr);
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${ampm}`;
}

export default function DateTimePicker({
  label,
  date,
  onDateChange,
  time,
  onTimeChange,
  showTime = false,
  required = false,
  error,
}: DateTimePickerProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    if (date) return new Date(date + 'T00:00').getFullYear();
    return new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (date) return new Date(date + 'T00:00').getMonth();
    return new Date().getMonth();
  });
  const [focusedDay, setFocusedDay] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const pickerId = label.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${pickerId}-error`;
  const labelId = `${pickerId}-label`;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus management: when calendar opens, focus the selected or first available day
  useEffect(() => {
    if (calendarOpen && calendarRef.current) {
      const today = new Date().toISOString().split('T')[0];
      if (date) {
        const d = new Date(date + 'T00:00');
        if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
          setFocusedDay(d.getDate());
        } else {
          setFocusedDay(findFirstAvailableDay());
        }
      } else {
        setFocusedDay(findFirstAvailableDay());
      }
    }
  }, [calendarOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus the day button when focusedDay changes
  useEffect(() => {
    if (calendarOpen && focusedDay && calendarRef.current) {
      const btn = calendarRef.current.querySelector(`[data-day="${focusedDay}"]`) as HTMLButtonElement;
      btn?.focus();
    }
  }, [focusedDay, calendarOpen]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const today = new Date().toISOString().split('T')[0];

  const findFirstAvailableDay = useCallback(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    for (let d = 1; d <= daysInMonth; d++) {
      const m = (viewMonth + 1).toString().padStart(2, '0');
      const ds = d.toString().padStart(2, '0');
      if (`${viewYear}-${m}-${ds}` >= today) return d;
    }
    return 1;
  }, [viewYear, viewMonth, today]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDate = (day: number) => {
    const m = (viewMonth + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    onDateChange(`${viewYear}-${m}-${d}`);
    setCalendarOpen(false);
    triggerRef.current?.focus();
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCalendarKeyDown = (e: React.KeyboardEvent) => {
    if (!focusedDay) return;

    let newDay = focusedDay;
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newDay = focusedDay + 1;
        if (newDay > daysInMonth) { nextMonth(); setFocusedDay(1); return; }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newDay = focusedDay - 1;
        if (newDay < 1) { prevMonth(); setFocusedDay(null); return; }
        break;
      case 'ArrowDown':
        e.preventDefault();
        newDay = focusedDay + 7;
        if (newDay > daysInMonth) { nextMonth(); setFocusedDay(newDay - daysInMonth); return; }
        break;
      case 'ArrowUp':
        e.preventDefault();
        newDay = focusedDay - 7;
        if (newDay < 1) { prevMonth(); setFocusedDay(null); return; }
        break;
      case 'Home':
        e.preventDefault();
        newDay = 1;
        break;
      case 'End':
        e.preventDefault();
        newDay = daysInMonth;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        selectDate(focusedDay);
        return;
      case 'Escape':
        e.preventDefault();
        setCalendarOpen(false);
        triggerRef.current?.focus();
        return;
      default:
        return;
    }

    // Check if the new day is not in the past
    const m = (viewMonth + 1).toString().padStart(2, '0');
    const d = newDay.toString().padStart(2, '0');
    const dateStr = `${viewYear}-${m}-${d}`;
    if (dateStr >= today) {
      setFocusedDay(newDay);
    }
  };

  const getDayLabel = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const dayName = DAY_FULL_NAMES[d.getDay()];
    return `${dayName}, ${MONTH_NAMES[viewMonth]} ${day}, ${viewYear}`;
  };

  return (
    <div className="space-y-2">
      <label id={labelId} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-600 ml-1" aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>

      <div className="flex gap-3">
        {/* Date picker */}
        <div ref={containerRef} className="relative flex-1">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setCalendarOpen(!calendarOpen)}
            aria-haspopup="dialog"
            aria-expanded={calendarOpen}
            aria-labelledby={labelId}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? true : undefined}
            className={`w-full flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-left transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              error ? 'border-red-300 focus:ring-red-400' : 'border-slate-300 focus:ring-ihc-purple'
            } ${date ? 'text-slate-900' : 'text-slate-500'}`}
          >
            <svg className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            {date ? formatDisplayDate(date) : 'Select a date...'}
          </button>

          {calendarOpen && (
            <div
              ref={calendarRef}
              role="dialog"
              aria-modal="true"
              aria-label={`Choose date for ${label}`}
              className="absolute z-50 mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-lg p-3"
              onKeyDown={handleCalendarKeyDown}
            >
              {/* Month/Year header */}
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={prevMonth}
                  aria-label={`Previous month, ${MONTH_NAMES[viewMonth === 0 ? 11 : viewMonth - 1]}`}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-500" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-slate-700" aria-live="polite">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  aria-label={`Next month, ${MONTH_NAMES[viewMonth === 11 ? 0 : viewMonth + 1]}`}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-500" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Day names */}
              <div className="grid grid-cols-7 mb-1" role="row">
                {DAY_NAMES.map((d, i) => (
                  <div key={d} role="columnheader" aria-label={DAY_FULL_NAMES[i]} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7" role="grid" aria-label={`${MONTH_NAMES[viewMonth]} ${viewYear}`}>
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} role="gridcell" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const m = (viewMonth + 1).toString().padStart(2, '0');
                  const d = day.toString().padStart(2, '0');
                  const dateStr = `${viewYear}-${m}-${d}`;
                  const isSelected = dateStr === date;
                  const isToday = dateStr === today;
                  const isPast = dateStr < today;

                  return (
                    <button
                      key={day}
                      type="button"
                      role="gridcell"
                      data-day={day}
                      tabIndex={focusedDay === day ? 0 : -1}
                      onClick={() => selectDate(day)}
                      disabled={isPast}
                      aria-selected={isSelected}
                      aria-current={isToday ? 'date' : undefined}
                      aria-disabled={isPast}
                      aria-label={getDayLabel(day)}
                      className={`w-9 h-9 text-sm rounded-md transition-colors mx-auto flex items-center justify-center ${
                        isSelected
                          ? 'bg-ihc-deep text-white'
                          : isToday
                          ? 'bg-ihc-surface text-ihc-deep font-medium'
                          : isPast
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-slate-700 hover:bg-ihc-surface'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Time picker */}
        {showTime && onTimeChange && (
          <div className="w-36">
            <select
              value={time || ''}
              onChange={(e) => onTimeChange(e.target.value)}
              aria-label={`Time for ${label}`}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                error ? 'border-red-300 focus:ring-red-400' : 'border-slate-300 focus:ring-ihc-purple'
              } ${time ? 'text-slate-900' : 'text-slate-500'}`}
            >
              <option value="">Time...</option>
              {TIME_OPTIONS.map(t => (
                <option key={t} value={t}>{formatTime12(t)}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && <p id={errorId} className="text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}
