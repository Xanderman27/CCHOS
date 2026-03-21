'use client';

import { useI18n } from '@/lib/i18n';
import { US_STATES } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DateTimePicker from '@/components/ui/DateTimePicker';
import MaterialsChecklist, { MaterialSelection } from './MaterialsChecklist';

interface MailingFieldsProps {
  materials: MaterialSelection[];
  onMaterialsChange: (materials: MaterialSelection[]) => void;
  state: string;
  onStateChange: (state: string) => void;
  county: string;
  onCountyChange: (county: string) => void;
  address: string;
  onAddressChange: (address: string) => void;
  dateNeeded: string;
  onDateNeededChange: (date: string) => void;
  errors: Record<string, string>;
}

export default function MailingFields({
  materials,
  onMaterialsChange,
  state,
  onStateChange,
  county,
  onCountyChange,
  address,
  onAddressChange,
  dateNeeded,
  onDateNeededChange,
  errors,
}: MailingFieldsProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-5">
      <MaterialsChecklist
        selections={materials}
        onChange={onMaterialsChange}
        error={errors.materials}
      />

      <Select
        label={t('mailing.state')}
        required
        value={state}
        onChange={(e) => onStateChange(e.target.value)}
        options={US_STATES.map(s => ({ value: s, label: s }))}
        placeholder={t('mailing.state.placeholder')}
        error={errors.state}
      />

      <Input
        label={t('mailing.county')}
        required
        value={county}
        onChange={(e) => onCountyChange(e.target.value)}
        placeholder={t('mailing.county.placeholder')}
        error={errors.county}
      />

      <Input
        label={t('mailing.address')}
        required
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        placeholder={t('mailing.address.placeholder')}
        error={errors.address}
      />

      <DateTimePicker
        label={t('mailing.dateNeeded')}
        required
        date={dateNeeded}
        onDateChange={onDateNeededChange}
        error={errors.dateNeeded}
      />
    </div>
  );
}
