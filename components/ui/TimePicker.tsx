'use client';

import { useState, useRef, useEffect, useCallback, useId } from 'react';

// Generate 30-minute interval options
const TIME_OPTIONS_24: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    const hour = h.toString().padStart(2, '0');
    const min = m.toString().padStart(2, '0');
    TIME_OPTIONS_24.push(`${hour}:${min}`);
  }
}

/** Convert 24h "HH:MM" to display string like "1:30 PM" */
function formatTime12(time24: string): string {
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr);
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${ampm}`;
}

/**
 * Parse a user-typed time string into 24h "HH:MM" format.
 * Handles: "1pm", "1:30pm", "13:00", "1:30 PM", "130pm", "1 PM", etc.
 * Returns null if unparseable.
 */
function parseTimeInput(input: string): string | null {
  const s = input.trim().toLowerCase().replace(/\s+/g, '');
  if (!s) return null;

  // Try 24h format first: "13:00", "9:30"
  const match24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const h = parseInt(match24[1]);
    const m = parseInt(match24[2]);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
  }

  // Try 12h with colon: "1:30pm", "12:00am"
  const match12colon = s.match(/^(\d{1,2}):(\d{2})(am|pm)$/);
  if (match12colon) {
    let h = parseInt(match12colon[1]);
    const m = parseInt(match12colon[2]);
    const ampm = match12colon[3];
    if (h < 1 || h > 12 || m > 59) return null;
    if (ampm === 'pm' && h !== 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  // Try hour-only with am/pm: "1pm", "12am"
  const matchHourOnly = s.match(/^(\d{1,2})(am|pm)$/);
  if (matchHourOnly) {
    let h = parseInt(matchHourOnly[1]);
    const ampm = matchHourOnly[2];
    if (h < 1 || h > 12) return null;
    if (ampm === 'pm' && h !== 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:00`;
  }

  // Try without colon: "130pm", "1030am"
  const matchNoColon = s.match(/^(\d{1,2})(\d{2})(am|pm)$/);
  if (matchNoColon) {
    let h = parseInt(matchNoColon[1]);
    const m = parseInt(matchNoColon[2]);
    const ampm = matchNoColon[3];
    if (h < 1 || h > 12 || m > 59) return null;
    if (ampm === 'pm' && h !== 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  return null;
}

interface TimePickerProps {
  label: string;
  value: string;        // 24h format "HH:MM" or ""
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
}

export default function TimePicker({ label, value, onChange, error, placeholder = 'e.g. 2:00 PM' }: TimePickerProps) {
  const [inputValue, setInputValue] = useState(() => value ? formatTime12(value) : '');
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const uniqueId = useId();
  const inputId = `timepicker-${uniqueId}`;
  const listboxId = `timepicker-listbox-${uniqueId}`;
  const labelId = `timepicker-label-${uniqueId}`;
  const errorId = `timepicker-error-${uniqueId}`;

  // Sync display when value changes externally
  useEffect(() => {
    if (value) {
      setInputValue(formatTime12(value));
    } else {
      setInputValue('');
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        commitValue();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter dropdown options based on typed text
  const filtered = inputValue.trim()
    ? TIME_OPTIONS_24.filter(t => {
        const display = formatTime12(t).toLowerCase();
        const search = inputValue.trim().toLowerCase();
        return display.includes(search) || t.includes(search);
      })
    : TIME_OPTIONS_24;

  // Scroll highlighted item into view
  useEffect(() => {
    if (open && highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[highlightIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex, open]);

  // When dropdown opens, scroll to the currently selected value
  useEffect(() => {
    if (open && value && listRef.current) {
      const idx = filtered.findIndex(t => t === value);
      if (idx >= 0) {
        setHighlightIndex(idx);
        setTimeout(() => {
          const items = listRef.current?.querySelectorAll('[role="option"]');
          items?.[idx]?.scrollIntoView({ block: 'center' });
        }, 0);
      }
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const commitValue = useCallback(() => {
    const parsed = parseTimeInput(inputValue);
    if (parsed) {
      onChange(parsed);
      setInputValue(formatTime12(parsed));
    } else if (inputValue.trim() === '') {
      onChange('');
    } else {
      // Revert to last valid value
      setInputValue(value ? formatTime12(value) : '');
    }
  }, [inputValue, value, onChange]);

  const selectOption = (time24: string) => {
    onChange(time24);
    setInputValue(formatTime12(time24));
    setOpen(false);
    setHighlightIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      setHighlightIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && highlightIndex >= 0 && highlightIndex < filtered.length) {
        selectOption(filtered[highlightIndex]);
      } else {
        commitValue();
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setInputValue(value ? formatTime12(value) : '');
    } else if (e.key === 'Tab') {
      commitValue();
      setOpen(false);
    }
  };

  const activeDescendantId = open && highlightIndex >= 0 && highlightIndex < filtered.length
    ? `${listboxId}-option-${highlightIndex}`
    : undefined;

  return (
    <div ref={containerRef} className="relative">
      <label id={labelId} htmlFor={inputId} className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <div
        className={`flex items-center border rounded-md transition-colors ${
          error ? 'border-red-300' : open ? 'border-ihc-purple ring-2 ring-ihc-purple ring-offset-1' : 'border-slate-300'
        }`}
      >
        <svg className="w-4 h-4 text-slate-400 ml-3 shrink-0" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendantId}
          aria-autocomplete="list"
          aria-labelledby={labelId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
            setHighlightIndex(-1);
          }}
          onFocus={() => {
            setOpen(true);
            inputRef.current?.select();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-2 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none rounded-md bg-transparent"
          autoComplete="off"
        />
      </div>

      {open && filtered.length > 0 && (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={label}
          className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {filtered.map((time, i) => (
            <div
              key={time}
              id={`${listboxId}-option-${i}`}
              role="option"
              aria-selected={time === value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectOption(time)}
              className={`w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors ${
                time === value
                  ? 'bg-ihc-surface text-ihc-deep font-medium'
                  : i === highlightIndex
                  ? 'bg-slate-50 text-slate-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {formatTime12(time)}
            </div>
          ))}
        </div>
      )}

      {error && <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}
