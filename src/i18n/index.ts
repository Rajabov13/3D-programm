import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { en } from './en';
import { ru } from './ru';
import { uz, type DictKey } from './uz';

export type Lang = 'uz' | 'ru' | 'en';
export type L10n = Record<Lang, string>;
export type { DictKey };

export const LANGS: Array<{ id: Lang; label: string; short: string }> = [
  { id: 'uz', label: 'Oʻzbekcha', short: 'UZ' },
  { id: 'ru', label: 'Русский', short: 'RU' },
  { id: 'en', label: 'English', short: 'EN' },
];

const DICTS: Record<Lang, Record<DictKey, string>> = { uz, ru, en };

/** Builds a localized string: tx('Salom', 'Привет', 'Hello'). */
export const tx = (uz: string, ru: string, en: string): L10n => ({ uz, ru, en });

function detect(): Lang {
  if (typeof navigator === 'undefined') return 'uz';
  for (const l of navigator.languages ?? [navigator.language]) {
    const code = l.toLowerCase();
    if (code.startsWith('uz')) return 'uz';
    if (code.startsWith('ru')) return 'ru';
    if (code.startsWith('en')) return 'en';
  }
  return 'uz';
}

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: detect(),
      setLang: (lang) => set({ lang }),
    }),
    { name: 'cw.lang.v1', version: 1 },
  ),
);

export function format(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

export function translate(lang: Lang, key: DictKey, vars?: Record<string, string | number>): string {
  return format(DICTS[lang][key] ?? DICTS.en[key] ?? key, vars);
}

/** Translate outside React (uses the current language). */
export function tNow(key: DictKey, vars?: Record<string, string | number>): string {
  return translate(useLangStore.getState().lang, key, vars);
}

export type TFunction = (key: DictKey, vars?: Record<string, string | number>) => string;

export function useLang(): Lang {
  return useLangStore((s) => s.lang);
}

/** UI strings: const t = useT(); t('nav.map') */
export function useT(): TFunction {
  const lang = useLang();
  return (key, vars) => translate(lang, key, vars);
}

/** Localized content: const l = useL(); l(level.title) */
export function useL(): (text: L10n) => string {
  const lang = useLang();
  return (text) => text[lang] || text.en;
}

/** Keeps <html lang> in sync for screen readers and hyphenation. */
export function useHtmlLang(): void {
  const lang = useLang();
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
}

export { DICTS };
