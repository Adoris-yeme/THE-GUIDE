import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { fr } from './fr';
import { en } from './en';

const translations = { fr, en };
type Language = keyof typeof translations;
type TranslationKey = string;

const getFromStorage = (key: string, defaultValue: Language): Language => {
  try {
    const item = window.localStorage.getItem(key);
    const lang = item ? JSON.parse(item) : defaultValue;
    return lang in translations ? lang : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: Language) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage key “${key}”:`, error);
  }
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const resolveKey = (obj: any, key: string): string | undefined => {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const I18nProvider = ({ children }: PropsWithChildren<{}>) => {
  const [lang, setLang] = useState<Language>(() => getFromStorage('user_lang', 'fr'));
  
  useEffect(() => saveToStorage('user_lang', lang), [lang]);

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = resolveKey(translations[lang], key) || resolveKey(translations['fr'], key) || key;
    if (params) {
        Object.keys(params).forEach(pKey => {
            text = text.replace(`{${pKey}}`, String(params[pKey]));
        });
    }
    return text;
  };

  const value = { lang, setLang, t };
  return React.createElement(I18nContext.Provider, { value }, children);
};

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};
