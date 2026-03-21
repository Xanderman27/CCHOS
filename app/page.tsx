'use client';

import { useEffect } from 'react';
import { I18nProvider, useI18n } from '@/lib/i18n';
import RequestForm from '@/components/form/RequestForm';
import LanguageToggle from '@/components/form/LanguageToggle';

function FormPage() {
  const { locale, t } = useI18n();

  // Update <html> lang attribute when locale changes
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div className="min-h-screen bg-ihc-surface">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Skip to main content link */}
        <a
          href="#main-form"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ihc-deep focus:rounded-md focus:shadow-lg focus:border focus:border-ihc-light"
        >
          Skip to form
        </a>

        {/* Brand Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <img src="/logo-light.png" alt="Intermountain Health" className="h-12 w-auto" />
            <LanguageToggle />
          </div>
          <h1 className="text-xl font-semibold text-ihc-deep">
            {t('header.title')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('header.subtitle')}{' '}
            <a
              href={t('header.website')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ihc-purple underline hover:text-ihc-deep"
            >
              intermountainhealthcare.org
            </a>
          </p>
          <p className="text-sm text-slate-500 mt-2">
            {t('header.gunlocks')}{' '}
            <a
              href={t('header.gunlocks_url')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ihc-purple underline hover:text-ihc-deep"
            >
              {locale === 'en' ? 'this website' : 'este sitio web'}
            </a>
            .
          </p>
        </header>

        {/* Form Card */}
        <main id="main-form" className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <RequestForm />
        </main>

        {/* Footer */}
        <footer className="mt-6 text-center text-xs text-slate-400">
          Children&apos;s Community Health &bull; Intermountain Health
        </footer>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <I18nProvider>
      <FormPage />
    </I18nProvider>
  );
}
