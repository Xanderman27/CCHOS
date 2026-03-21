'use client';

import { useState } from 'react';
import { MATERIAL_CATEGORIES } from '@/lib/materials';
import { useI18n } from '@/lib/i18n';

export interface MaterialSelection {
  itemId: string;
  quantity: number;
}

interface MaterialsChecklistProps {
  selections: MaterialSelection[];
  onChange: (selections: MaterialSelection[]) => void;
  error?: string;
}

export default function MaterialsChecklist({ selections, onChange, error }: MaterialsChecklistProps) {
  const { locale, t } = useI18n();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(MATERIAL_CATEGORIES.map(c => c.id))
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const isSelected = (itemId: string) => selections.some(s => s.itemId === itemId);

  const getQuantity = (itemId: string) => {
    const sel = selections.find(s => s.itemId === itemId);
    return sel?.quantity || 0;
  };

  const toggleItem = (itemId: string) => {
    if (isSelected(itemId)) {
      onChange(selections.filter(s => s.itemId !== itemId));
    } else {
      onChange([...selections, { itemId, quantity: 25 }]);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    onChange(
      selections.map(s =>
        s.itemId === itemId ? { ...s, quantity: Math.max(1, quantity) } : s
      )
    );
  };

  return (
    <fieldset>
      <legend className="block text-sm font-medium text-slate-700 mb-1">
        {t('mailing.materials')}
        <span className="text-red-600 ml-1" aria-hidden="true">*</span>
        <span className="sr-only"> (required)</span>
      </legend>
      <p className="text-sm text-slate-500 mb-3">
        {t('mailing.materials.description')}{' '}
        <a
          href="https://intermountainhealthcare.org/primary-childrens/wellness-prevention"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ihc-purple underline hover:text-ihc-deep"
          aria-label="Learn more about available education materials and safety devices"
        >
          Learn more
        </a>
      </p>

      {error && <p className="mb-2 text-sm text-red-600" role="alert">{error}</p>}

      <div className="space-y-2">
        {MATERIAL_CATEGORIES.map(category => {
          const isExpanded = expandedCategories.has(category.id);
          const categoryName = locale === 'es' ? category.nameEs : category.nameEn;
          const regionId = `materials-region-${category.id}`;

          return (
            <div key={category.id} className="border border-slate-200 rounded-md">
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                aria-expanded={isExpanded}
                aria-controls={regionId}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <span>{categoryName}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div id={regionId} role="region" aria-label={categoryName} hidden={!isExpanded}>
                {isExpanded && (
                  <div className="px-4 pb-3 space-y-2">
                    {category.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={item.id}
                          checked={isSelected(item.id)}
                          onChange={() => toggleItem(item.id)}
                          className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-ihc-purple"
                        />
                        <label
                          htmlFor={item.id}
                          className="flex-1 text-sm text-slate-700 cursor-pointer"
                        >
                          {locale === 'es' ? item.nameEs : item.nameEn}
                        </label>
                        {isSelected(item.id) && (
                          <div className="flex items-center gap-1.5">
                            <label htmlFor={`qty-${item.id}`} className="text-xs text-slate-500">
                              {t('mailing.qty')}:
                            </label>
                            <input
                              id={`qty-${item.id}`}
                              type="number"
                              min="1"
                              value={getQuantity(item.id)}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              aria-label={`Quantity for ${locale === 'es' ? item.nameEs : item.nameEn}`}
                              className="w-20 rounded border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-ihc-purple"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
