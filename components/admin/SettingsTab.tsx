'use client';

import { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { US_STATES, UTAH_COUNTIES } from '@/lib/constants';
import { COUNTIES_BY_STATE } from '@/lib/counties';

// --- Searchable single-select dropdown ---
function SearchableSelect({
  label,
  placeholder,
  options,
  onSelect,
}: {
  label: string;
  placeholder: string;
  options: string[];
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = search
    ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <div
        className="flex items-center border border-slate-300 rounded-md cursor-text"
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        <svg className="w-4 h-4 text-slate-400 ml-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full px-2 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none rounded-md"
        />
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-400">No results</div>
          ) : (
            filtered.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onSelect(option);
                  setOpen(false);
                  setSearch('');
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {option}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// --- Multi-select dropdown with search ---
function MultiSelectDropdown({
  label,
  placeholder,
  options,
  selected,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: {
  label: string;
  placeholder: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = search
    ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const selectedCount = options.filter(o => selected.includes(o)).length;

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="w-full flex items-center justify-between border border-slate-300 rounded-md px-3 py-2 text-sm text-left hover:border-slate-400 transition-colors"
      >
        <span className={selectedCount > 0 ? 'text-slate-700' : 'text-slate-400'}>
          {selectedCount > 0 ? `${selectedCount} of ${options.length} counties selected` : placeholder}
        </span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg">
          {/* Search + bulk actions */}
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center border border-slate-200 rounded-md mb-2">
              <svg className="w-4 h-4 text-slate-400 ml-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search counties..."
                className="w-full px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onSelectAll} className="text-xs text-slate-500 hover:text-slate-700 underline">
                Select All
              </button>
              <button type="button" onClick={onDeselectAll} className="text-xs text-slate-500 hover:text-slate-700 underline">
                Deselect All
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-400">No results</div>
            ) : (
              filtered.map(option => (
                <label
                  key={option}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => onToggle(option)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-ihc-purple"
                  />
                  {option}
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- State card showing selected state with county picker ---
function StateCard({
  state,
  counties,
  selectedCounties,
  onToggleCounty,
  onSelectAll,
  onDeselectAll,
  onRemoveState,
}: {
  state: string;
  counties: readonly string[] | undefined;
  selectedCounties: string[];
  onToggleCounty: (county: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRemoveState: () => void;
}) {
  const stateCountyCount = counties ? counties.filter(c => selectedCounties.includes(c)).length : 0;

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">{state}</span>
          {counties && (
            <span className="text-xs text-slate-400">
              {stateCountyCount} of {counties.length} counties
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onRemoveState}
          className="text-slate-400 hover:text-red-500 transition-colors p-1"
          title={`Remove ${state}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {counties && counties.length > 0 ? (
        <MultiSelectDropdown
          label=""
          placeholder="Select counties..."
          options={counties}
          selected={selectedCounties}
          onToggle={onToggleCounty}
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
        />
      ) : (
        <p className="text-xs text-slate-400">All counties in this state are included.</p>
      )}
    </div>
  );
}

// --- Main SettingsTab ---
export default function SettingsTab() {
  const [selectedStates, setSelectedStates] = useState<string[]>(['Utah']);
  const [selectedCounties, setSelectedCounties] = useState<string[]>([...UTAH_COUNTIES]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const availableStatesToAdd = US_STATES.filter(s => !selectedStates.includes(s));

  const handleAddState = (state: string) => {
    if (selectedStates.includes(state)) return;
    setSelectedStates(prev => [...prev, state]);
    // Auto-select all counties for the new state
    const counties = COUNTIES_BY_STATE[state];
    if (counties) {
      setSelectedCounties(prev => [...new Set([...prev, ...counties])]);
    }
  };

  const handleRemoveState = (state: string) => {
    setSelectedStates(prev => prev.filter(s => s !== state));
    const counties = COUNTIES_BY_STATE[state] || [];
    setSelectedCounties(prev => prev.filter(c => !counties.includes(c)));
  };

  const handleToggleCounty = (county: string) => {
    setSelectedCounties(prev =>
      prev.includes(county) ? prev.filter(c => c !== county) : [...prev, county]
    );
  };

  const handleSelectAllCounties = (state: string) => {
    const counties = COUNTIES_BY_STATE[state] || [];
    setSelectedCounties(prev => [...new Set([...prev, ...counties])]);
  };

  const handleDeselectAllCounties = (state: string) => {
    const counties = COUNTIES_BY_STATE[state] || [];
    setSelectedCounties(prev => prev.filter(c => !counties.includes(c)));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResetToUtah = () => {
    setSelectedStates(['Utah']);
    setSelectedCounties([...UTAH_COUNTIES]);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-1">Service Area Configuration</h3>
        <p className="text-sm text-slate-500 mb-5">
          Define the geographic area where Community Health staff can be deployed for in-person events.
          Events outside this area will be automatically recommended for mail-based fulfillment.
        </p>

        <div className="space-y-4">
          {/* Add State dropdown */}
          <SearchableSelect
            label="Add a State to Service Area"
            placeholder="Search and select a state..."
            options={[...availableStatesToAdd]}
            onSelect={handleAddState}
          />

          {/* Selected states with county pickers */}
          {selectedStates.length > 0 && (
            <div className="space-y-3 mt-4">
              <label className="block text-xs font-medium text-slate-500">
                Service Area States ({selectedStates.length})
              </label>
              {selectedStates.map(state => (
                <StateCard
                  key={state}
                  state={state}
                  counties={COUNTIES_BY_STATE[state]}
                  selectedCounties={selectedCounties}
                  onToggleCounty={handleToggleCounty}
                  onSelectAll={() => handleSelectAllCounties(state)}
                  onDeselectAll={() => handleDeselectAllCounties(state)}
                  onRemoveState={() => handleRemoveState(state)}
                />
              ))}
            </div>
          )}

          {selectedStates.length === 0 && (
            <div className="text-sm text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-lg">
              No states selected. Use the dropdown above to add states to the service area.
            </div>
          )}

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <Button onClick={handleSave} loading={saving}>
              Save Settings
            </Button>
            <Button variant="secondary" onClick={handleResetToUtah}>
              Reset to Utah Default
            </Button>
            {saved && (
              <span className="text-sm text-emerald-600">Settings saved.</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-1">System Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Application</span>
            <span className="text-slate-700">Children&apos;s Community Health Request System</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Version</span>
            <span className="text-slate-700 font-mono">1.0.0 (Prototype)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">AI Engine</span>
            <span className="text-slate-700">Claude (Anthropic)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Database</span>
            <span className="text-slate-700">SQLite</span>
          </div>
        </div>
      </div>
    </div>
  );
}
