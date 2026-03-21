'use client';

import { useI18n } from '@/lib/i18n';
import { TARGET_AUDIENCES, TOPICS } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import DateTimePicker from '@/components/ui/DateTimePicker';
import TimePicker from '@/components/ui/TimePicker';

interface EventFieldsProps {
  requestType: 'in_person' | 'virtual';
  eventDate: string;
  onEventDateChange: (date: string) => void;
  startTime: string;
  onStartTimeChange: (time: string) => void;
  endTime: string;
  onEndTimeChange: (time: string) => void;
  eventAddress: string;
  onEventAddressChange: (address: string) => void;
  indoorOutdoor: string;
  onIndoorOutdoorChange: (value: string) => void;
  parkingInstructions: string;
  onParkingInstructionsChange: (value: string) => void;
  targetAudience: string[];
  onTargetAudienceChange: (audience: string[]) => void;
  estimatedAttendees: string;
  onEstimatedAttendeesChange: (value: string) => void;
  topics: string[];
  onTopicsChange: (topics: string[]) => void;
  requestorAttending: boolean;
  onRequestorAttendingChange: (value: boolean) => void;
  errors: Record<string, string>;
}

export default function EventFields({
  requestType,
  eventDate,
  onEventDateChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  eventAddress,
  onEventAddressChange,
  indoorOutdoor,
  onIndoorOutdoorChange,
  parkingInstructions,
  onParkingInstructionsChange,
  targetAudience,
  onTargetAudienceChange,
  estimatedAttendees,
  onEstimatedAttendeesChange,
  topics,
  onTopicsChange,
  requestorAttending,
  onRequestorAttendingChange,
  errors,
}: EventFieldsProps) {
  const { locale, t } = useI18n();
  const isInPerson = requestType === 'in_person';

  const toggleAudience = (id: string) => {
    if (targetAudience.includes(id)) {
      onTargetAudienceChange(targetAudience.filter(a => a !== id));
    } else {
      onTargetAudienceChange([...targetAudience, id]);
    }
  };

  const toggleTopic = (id: string) => {
    if (topics.includes(id)) {
      onTopicsChange(topics.filter(t => t !== id));
    } else {
      onTopicsChange([...topics, id]);
    }
  };

  return (
    <div className="space-y-5">
      <DateTimePicker
        label={t('event.date')}
        required
        date={eventDate}
        onDateChange={onEventDateChange}
        error={errors.eventDate}
      />

      <fieldset>
        <legend className="block text-sm font-medium text-slate-700 mb-1">
          {t('event.startEndTime')}
          <span className="text-red-600 ml-1" aria-hidden="true">*</span>
          <span className="sr-only"> (required)</span>
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <TimePicker
            label={t('event.startTime')}
            value={startTime}
            onChange={onStartTimeChange}
            error={errors.startTime}
          />
          <TimePicker
            label={t('event.endTime')}
            value={endTime}
            onChange={onEndTimeChange}
            error={errors.endTime}
          />
        </div>
      </fieldset>

      {isInPerson && (
        <>
          <Textarea
            label={t('event.address')}
            required
            value={eventAddress}
            onChange={(e) => onEventAddressChange(e.target.value)}
            placeholder={t('event.address.placeholder')}
            error={errors.eventAddress}
          />

          <fieldset role="radiogroup">
            <legend className="block text-sm font-medium text-slate-700 mb-1">
              {t('event.indoorOutdoor')}
            </legend>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="indoorOutdoor"
                  value="indoor"
                  checked={indoorOutdoor === 'indoor'}
                  onChange={(e) => onIndoorOutdoorChange(e.target.value)}
                  className="h-4 w-4 border-slate-300 text-ihc-purple accent-ihc-purple focus:ring-ihc-purple"
                />
                {t('event.indoor')}
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="indoorOutdoor"
                  value="outdoor"
                  checked={indoorOutdoor === 'outdoor'}
                  onChange={(e) => onIndoorOutdoorChange(e.target.value)}
                  className="h-4 w-4 border-slate-300 text-ihc-purple accent-ihc-purple focus:ring-ihc-purple"
                />
                {t('event.outdoor')}
              </label>
            </div>
          </fieldset>

          <Textarea
            label={t('event.parking')}
            value={parkingInstructions}
            onChange={(e) => onParkingInstructionsChange(e.target.value)}
            placeholder={t('event.parking.placeholder')}
          />
        </>
      )}

      <fieldset aria-required="true">
        <legend className="block text-sm font-medium text-slate-700 mb-1">
          {t('event.audience')}
          <span className="text-red-600 ml-1" aria-hidden="true">*</span>
          <span className="sr-only"> (required)</span>
        </legend>
        {errors.targetAudience && <p className="mb-2 text-sm text-red-600" role="alert">{errors.targetAudience}</p>}
        <div className="space-y-2">
          {TARGET_AUDIENCES.map(aud => (
            <label key={aud.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={targetAudience.includes(aud.id)}
                onChange={() => toggleAudience(aud.id)}
                className="h-4 w-4 rounded border-slate-300 text-ihc-purple accent-ihc-purple focus:ring-ihc-purple"
              />
              {locale === 'es' ? aud.es : aud.en}
            </label>
          ))}
        </div>
      </fieldset>

      <Input
        label={t('event.attendees')}
        required
        type="number"
        min="1"
        value={estimatedAttendees}
        onChange={(e) => onEstimatedAttendeesChange(e.target.value)}
        placeholder={t('event.attendees.placeholder')}
        error={errors.estimatedAttendees}
      />

      <fieldset aria-required="true">
        <legend className="block text-sm font-medium text-slate-700 mb-1">
          {t('event.topics')}
          <span className="text-red-600 ml-1" aria-hidden="true">*</span>
          <span className="sr-only"> (required)</span>
        </legend>
        <p className="text-sm text-slate-500 mb-2">
          {t('event.topics.description')}{' '}
          <a
            href="https://intermountainhealthcare.org/primary-childrens/wellness-prevention"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ihc-purple underline hover:text-ihc-deep"
            aria-label="Learn more about available health and safety topics"
          >
            Learn more
          </a>
        </p>
        {errors.topics && <p className="mb-2 text-sm text-red-600" role="alert">{errors.topics}</p>}
        <div className="space-y-2">
          {TOPICS.map(topic => (
            <label key={topic.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={topics.includes(topic.id)}
                onChange={() => toggleTopic(topic.id)}
                className="h-4 w-4 rounded border-slate-300 text-ihc-purple accent-ihc-purple focus:ring-ihc-purple"
              />
              {locale === 'es' ? topic.es : topic.en}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset role="radiogroup">
        <legend className="block text-sm font-medium text-slate-700 mb-1">
          {t('event.attending')}
        </legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="radio"
              name="requestorAttending"
              checked={requestorAttending === true}
              onChange={() => onRequestorAttendingChange(true)}
              className="h-4 w-4 border-slate-300 text-ihc-purple accent-ihc-purple focus:ring-ihc-purple"
            />
            {t('event.yes')}
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="radio"
              name="requestorAttending"
              checked={requestorAttending === false}
              onChange={() => onRequestorAttendingChange(false)}
              className="h-4 w-4 border-slate-300 text-ihc-purple accent-ihc-purple focus:ring-ihc-purple"
            />
            {t('event.no')}
          </label>
        </div>
      </fieldset>
    </div>
  );
}
