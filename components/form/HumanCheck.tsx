'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface HumanCheckProps {
  verified: boolean;
  onVerify: (verified: boolean) => void;
  error?: string;
}

/**
 * Local "I'm not a robot" verification widget.
 * Uses a small interactive challenge (click-and-hold)
 * plus a honeypot timing check to deter bots — no external service needed.
 */
export default function HumanCheck({ verified, onVerify, error }: HumanCheckProps) {
  const [checking, setChecking] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountTime = useRef(Date.now());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startHold = useCallback(() => {
    if (verified) return;

    // Timing check: if the form was filled in < 2 seconds, suspicious
    const elapsed = Date.now() - mountTime.current;
    if (elapsed < 2000) return;

    setChecking(true);
    setHoldProgress(0);

    let progress = 0;
    intervalRef.current = setInterval(() => {
      progress += 4;
      setHoldProgress(progress);

      if (progress >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setChecking(false);
        onVerify(true);
      }
    }, 30);
  }, [verified, onVerify]);

  const stopHold = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (!verified) {
      setChecking(false);
      setHoldProgress(0);
    }
  }, [verified]);

  return (
    <div
      className={`rounded-lg border-2 p-4 transition-colors ${
        verified
          ? 'border-emerald-300 bg-emerald-50'
          : error
          ? 'border-red-300 bg-red-50'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Checkbox area */}
        <button
          type="button"
          onMouseDown={startHold}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={startHold}
          onTouchEnd={stopHold}
          disabled={verified}
          aria-label={verified ? 'Verified as human' : 'Press and hold to verify you are human'}
          className={`relative flex items-center justify-center w-7 h-7 rounded border-2 transition-all shrink-0 ${
            verified
              ? 'border-emerald-500 bg-emerald-500 cursor-default'
              : checking
              ? 'border-ihc-purple bg-white cursor-pointer'
              : 'border-slate-300 bg-white hover:border-ihc-purple cursor-pointer'
          }`}
        >
          {verified ? (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : checking ? (
            <div
              className="absolute inset-0.5 rounded-sm bg-ihc-purple/20 origin-left transition-transform"
              style={{ transform: `scaleX(${holdProgress / 100})` }}
            />
          ) : null}
        </button>

        <div className="flex-1 min-w-0">
          <span className={`text-sm font-medium ${verified ? 'text-emerald-700' : 'text-slate-700'}`}>
            {verified ? 'Verified — you\'re human!' : checking ? 'Keep holding...' : 'I\'m not a robot'}
          </span>
          {!verified && !checking && (
            <p className="text-xs text-slate-400 mt-0.5">Click and hold the checkbox to verify</p>
          )}
        </div>

        {/* Shield icon */}
        <div className={`shrink-0 ${verified ? 'text-emerald-500' : 'text-slate-300'}`}>
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
      </div>

      {/* Hidden honeypot field — bots will fill this, humans won't see it */}
      <input
        type="text"
        name="website_url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute opacity-0 h-0 w-0 overflow-hidden pointer-events-none"
      />

      {error && (
        <p className="text-xs text-red-600 mt-2" role="alert">{error}</p>
      )}
    </div>
  );
}
