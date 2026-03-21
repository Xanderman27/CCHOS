'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import MailingFields from './MailingFields';
import EventFields from './EventFields';
import MaterialsChecklist from './MaterialsChecklist';
import type { MaterialSelection } from './MaterialsChecklist';
import DateTimePicker from '@/components/ui/DateTimePicker';
import HumanCheck from './HumanCheck';

type RequestType = '' | 'mailing' | 'in_person' | 'virtual' | 'pickup';

interface FormState {
  name: string;
  organization: string;
  email: string;
  requestType: RequestType;
  // Mailing
  materials: MaterialSelection[];
  shippingAddress: string;
  state: string;
  county: string;
  dateNeeded: string;
  // Event
  eventDate: string;
  startTime: string;
  endTime: string;
  eventAddress: string;
  indoorOutdoor: string;
  parkingInstructions: string;
  targetAudience: string[];
  estimatedAttendees: string;
  topics: string[];
  requestorAttending: boolean;
  // Shared
  additionalNotes: string;
}

const initialFormState: FormState = {
  name: '',
  organization: '',
  email: '',
  requestType: '',
  materials: [],
  shippingAddress: '',
  state: '',
  county: '',
  dateNeeded: '',
  eventDate: '',
  startTime: '',
  endTime: '',
  eventAddress: '',
  indoorOutdoor: '',
  parkingInstructions: '',
  targetAudience: [],
  estimatedAttendees: '',
  topics: [],
  requestorAttending: false,
  additionalNotes: '',
};

export default function RequestForm() {
  const { t } = useI18n();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [humanVerified, setHumanVerified] = useState(false);
  const [requestId, setRequestId] = useState<number | null>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Focus the success heading when submission completes
  useEffect(() => {
    if (submitted && successRef.current) {
      successRef.current.focus();
    }
  }, [submitted]);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = t('validation.required');
    if (!form.organization.trim()) newErrors.organization = t('validation.required');
    if (!form.email.trim()) {
      newErrors.email = t('validation.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = t('validation.email');
    }
    if (!form.requestType) newErrors.requestType = t('validation.required');
    if (!humanVerified) newErrors.humanCheck = 'Please verify you are not a robot';

    if (form.requestType === 'mailing') {
      if (form.materials.length === 0) newErrors.materials = t('validation.selectMaterials');
      if (!form.state) newErrors.state = t('validation.required');
      if (!form.county.trim()) newErrors.county = t('validation.required');
      if (!form.shippingAddress.trim()) newErrors.address = t('validation.required');
      if (!form.dateNeeded) newErrors.dateNeeded = t('validation.required');
    }

    if (form.requestType === 'pickup') {
      if (form.materials.length === 0) newErrors.materials = t('validation.selectMaterials');
      if (!form.dateNeeded) newErrors.dateNeeded = t('validation.required');
    }

    if (form.requestType === 'in_person' || form.requestType === 'virtual') {
      if (!form.eventDate) newErrors.eventDate = t('validation.required');
      if (!form.startTime) newErrors.startTime = t('validation.required');
      if (!form.endTime) newErrors.endTime = t('validation.required');
      if (form.requestType === 'in_person' && !form.eventAddress.trim()) {
        newErrors.eventAddress = t('validation.required');
      }
      if (form.targetAudience.length === 0) newErrors.targetAudience = t('validation.required');
      if (!form.estimatedAttendees) newErrors.estimatedAttendees = t('validation.required');
      if (form.topics.length === 0) newErrors.topics = t('validation.selectTopics');
    }

    setErrors(newErrors);

    // Focus the first field with an error
    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = Object.keys(newErrors)[0];
      const firstErrorEl = formRef.current?.querySelector(`[id*="${firstErrorKey}"], [name="${firstErrorKey}"]`) as HTMLElement;
      firstErrorEl?.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        organization: form.organization.trim(),
        email: form.email.trim(),
        request_type: form.requestType,
        additional_notes: form.additionalNotes.trim() || null,
      };

      if (form.requestType === 'mailing') {
        body.materials = JSON.stringify(form.materials);
        body.shipping_address = form.shippingAddress.trim();
        body.state = form.state;
        body.county = form.county.trim();
        body.date_needed = form.dateNeeded;
      }

      if (form.requestType === 'pickup') {
        body.materials = JSON.stringify(form.materials);
        body.date_needed = form.dateNeeded;
      }

      if (form.requestType === 'in_person' || form.requestType === 'virtual') {
        body.event_date = form.eventDate;
        body.start_time = form.startTime;
        body.end_time = form.endTime;
        body.event_address = form.eventAddress.trim() || null;
        body.indoor_outdoor = form.indoorOutdoor || null;
        body.parking_instructions = form.parkingInstructions.trim() || null;
        body.target_audience = JSON.stringify(form.targetAudience);
        body.estimated_attendees = parseInt(form.estimatedAttendees) || null;
        body.topics = JSON.stringify(form.topics);
        body.requestor_attending = form.requestorAttending ? 1 : 0;
      }

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error('Failed to submit request');
      }

      const data = await res.json();
      setRequestId(data.id);
      setSubmitted(true);
    } catch {
      setErrors({ submit: 'Failed to submit request. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12" role="status" aria-live="polite">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-4">
          <svg className="w-8 h-8 text-ihc-teal" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 ref={successRef} tabIndex={-1} className="text-xl font-semibold text-ihc-deep mb-2 outline-none">{t('success.title')}</h2>
        <p className="text-slate-600 mb-4">{t('success.message')}</p>
        {requestId && (
          <p className="text-sm text-slate-500 mb-6">
            {t('success.requestId')} <span className="font-mono font-medium text-slate-700">#{requestId}</span>
          </p>
        )}
        <Button
          variant="secondary"
          onClick={() => {
            setForm(initialFormState);
            setSubmitted(false);
            setRequestId(null);
            setErrors({});
            setHumanVerified(false);
          }}
        >
          {t('success.newRequest')}
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Error summary for screen readers */}
      {Object.keys(errors).length > 0 && (
        <div role="alert" className="sr-only">
          {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} found. Please correct the highlighted fields.
        </div>
      )}

      {/* Contact Information section */}
      <fieldset>
        <legend className="text-base font-semibold text-ihc-deep mb-4">
          {t('form.contactInfo') || 'Contact Information'}
        </legend>

        <div className="space-y-4">
          <Input
            label={t('form.name')}
            required
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder={t('form.name.placeholder')}
            error={errors.name}
          />

          <Input
            label={t('form.organization')}
            required
            value={form.organization}
            onChange={(e) => updateField('organization', e.target.value)}
            placeholder={t('form.organization.placeholder')}
            error={errors.organization}
          />

          <Input
            label={t('form.email')}
            required
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder={t('form.email.placeholder')}
            error={errors.email}
          />
        </div>
      </fieldset>

      {/* Request type selector */}
      <fieldset role="radiogroup" aria-required="true">
        <legend className="block text-sm font-medium text-slate-700 mb-1">
          {t('form.requestType')}
          <span className="text-red-600 ml-1" aria-hidden="true">*</span>
          <span className="sr-only"> (required)</span>
        </legend>
        {errors.requestType && <p className="mb-2 text-sm text-red-600" role="alert">{errors.requestType}</p>}
        <div className="space-y-2">
          {(['mailing', 'in_person', 'virtual', 'pickup'] as const).map(type => (
            <label
              key={type}
              className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                form.requestType === type
                  ? 'border-ihc-purple bg-ihc-surface'
                  : 'border-slate-200 hover:bg-ihc-surface'
              }`}
            >
              <input
                type="radio"
                name="requestType"
                value={type}
                checked={form.requestType === type}
                onChange={(e) => updateField('requestType', e.target.value as RequestType)}
                className="mt-1 h-4 w-4 border-slate-300 text-ihc-purple focus:ring-ihc-purple accent-ihc-purple shrink-0"
              />
              <div className="min-w-0">
                <span className="text-sm text-slate-700">{t(`form.requestType.${type}`)}</span>
                <p className="text-xs text-slate-400 mt-0.5">{t(`form.requestType.${type}.desc`)}</p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Conditional fields based on request type */}
      {form.requestType === 'mailing' && (
        <div className="border-t border-slate-200 pt-6">
          <MailingFields
            materials={form.materials}
            onMaterialsChange={(m) => updateField('materials', m)}
            state={form.state}
            onStateChange={(s) => updateField('state', s)}
            county={form.county}
            onCountyChange={(c) => updateField('county', c)}
            address={form.shippingAddress}
            onAddressChange={(a) => updateField('shippingAddress', a)}
            dateNeeded={form.dateNeeded}
            onDateNeededChange={(d) => updateField('dateNeeded', d)}
            errors={errors}
          />
        </div>
      )}

      {form.requestType === 'pickup' && (
        <div className="border-t border-slate-200 pt-6">
          <div className="space-y-5">
            <MaterialsChecklist
              selections={form.materials}
              onChange={(m) => updateField('materials', m)}
              error={errors.materials}
            />
            <DateTimePicker
              label={t('pickup.dateNeeded')}
              required
              date={form.dateNeeded}
              onDateChange={(d) => updateField('dateNeeded', d)}
              error={errors.dateNeeded}
            />
          </div>
        </div>
      )}

      {(form.requestType === 'in_person' || form.requestType === 'virtual') && (
        <div className="border-t border-slate-200 pt-6">
          <EventFields
            requestType={form.requestType}
            eventDate={form.eventDate}
            onEventDateChange={(d) => updateField('eventDate', d)}
            startTime={form.startTime}
            onStartTimeChange={(t) => updateField('startTime', t)}
            endTime={form.endTime}
            onEndTimeChange={(t) => updateField('endTime', t)}
            eventAddress={form.eventAddress}
            onEventAddressChange={(a) => updateField('eventAddress', a)}
            indoorOutdoor={form.indoorOutdoor}
            onIndoorOutdoorChange={(v) => updateField('indoorOutdoor', v)}
            parkingInstructions={form.parkingInstructions}
            onParkingInstructionsChange={(v) => updateField('parkingInstructions', v)}
            targetAudience={form.targetAudience}
            onTargetAudienceChange={(a) => updateField('targetAudience', a)}
            estimatedAttendees={form.estimatedAttendees}
            onEstimatedAttendeesChange={(v) => updateField('estimatedAttendees', v)}
            topics={form.topics}
            onTopicsChange={(t) => updateField('topics', t)}
            requestorAttending={form.requestorAttending}
            onRequestorAttendingChange={(v) => updateField('requestorAttending', v)}
            errors={errors}
          />
        </div>
      )}

      {/* Additional Notes */}
      {form.requestType && (
        <Textarea
          label={t('form.additionalNotes')}
          value={form.additionalNotes}
          onChange={(e) => updateField('additionalNotes', e.target.value)}
          placeholder={t('form.additionalNotes.placeholder')}
        />
      )}

      {/* Human verification */}
      <HumanCheck
        verified={humanVerified}
        onVerify={(v) => {
          setHumanVerified(v);
          if (v && errors.humanCheck) {
            setErrors(prev => {
              const next = { ...prev };
              delete next.humanCheck;
              return next;
            });
          }
        }}
        error={errors.humanCheck}
      />

      {/* Submit */}
      {errors.submit && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200" role="alert">
          <p className="text-sm text-red-700">{errors.submit}</p>
        </div>
      )}

      <Button type="submit" loading={submitting} size="lg" className="w-full">
        {submitting ? t('form.submitting') : t('form.submit')}
      </Button>
    </form>
  );
}
