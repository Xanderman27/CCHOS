import { NextRequest, NextResponse } from 'next/server';

/** Language code → display name mapping */
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', pt: 'Portuguese',
  it: 'Italian', zh: 'Chinese', ja: 'Japanese', ko: 'Korean', ar: 'Arabic',
  ru: 'Russian', hi: 'Hindi', vi: 'Vietnamese', tl: 'Tagalog', th: 'Thai',
  uk: 'Ukrainian', pl: 'Polish', nl: 'Dutch', sv: 'Swedish', da: 'Danish',
  ro: 'Romanian', hu: 'Hungarian', cs: 'Czech', el: 'Greek', he: 'Hebrew',
  id: 'Indonesian', ms: 'Malay', tr: 'Turkish', fa: 'Persian', bn: 'Bengali',
  ur: 'Urdu', sw: 'Swahili', am: 'Amharic', my: 'Burmese', km: 'Khmer',
  lo: 'Lao', ne: 'Nepali', si: 'Sinhala', ka: 'Georgian', hy: 'Armenian',
};

/**
 * Use Google Translate API (free tier) to detect language and translate.
 * Translates to English by default; if already English, translates to Spanish.
 */
async function googleTranslate(text: string, sourceLang: string, targetLang: string): Promise<string> {
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', sourceLang);
  url.searchParams.set('tl', targetLang);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', text);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Google Translate returned ${res.status}`);

  const data = await res.json();
  // Response format: [[["translated text","original text",null,null,10]],null,"detected_lang"]
  const sentences: string[] = data[0].map((segment: [string]) => segment[0]);
  return sentences.join('');
}

async function detectLanguage(text: string): Promise<string> {
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', 'auto');
  url.searchParams.set('tl', 'en');
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', text);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Google Translate returned ${res.status}`);

  const data = await res.json();
  // data[2] contains the detected language code
  return data[2] || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Detect the source language
    const detectedCode = await detectLanguage(text);
    const detectedName = LANGUAGE_NAMES[detectedCode] || detectedCode;

    // If English, no translation needed
    if (detectedCode === 'en') {
      return NextResponse.json({
        detected_language: detectedName,
        is_english: true,
      });
    }

    // Translate non-English to English
    const translation = await googleTranslate(text, detectedCode, 'en');

    return NextResponse.json({
      detected_language: detectedName,
      translation,
      target_language: 'English',
      is_english: false,
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
