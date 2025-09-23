'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es';

export interface TranslationKeys {
  // Navigation
  'nav.home': string;
  'nav.teams': string;
  'nav.news': string;
  'nav.placements': string;
  'nav.schedule': string;
  'nav.liveStream': string;
  'nav.shop': string;
  'nav.about': string;
  'nav.ambassadors': string;
  'nav.contact': string;
  'nav.cart': string;

  // Common
  'common.loading': string;
  'common.error': string;
  'common.success': string;
  'common.save': string;
  'common.cancel': string;
  'common.submit': string;
  'common.close': string;
  'common.open': string;
  'common.back': string;
  'common.next': string;
  'common.previous': string;
  'common.search': string;

  // Footer
  'footer.copyright': string;
  'footer.allRightsReserved': string;
  'footer.aboutUs': string;
  'footer.contact': string;
  'footer.careers': string;

  // Language selector
  'language.selector': string;
  'language.english': string;
  'language.spanish': string;
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations: Record<Language, TranslationKeys> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.teams': 'Teams',
    'nav.news': 'News',
    'nav.placements': 'Placements',
    'nav.schedule': 'Schedule',
    'nav.liveStream': 'Live Stream',
    'nav.shop': 'Shop',
    'nav.about': 'About',
    'nav.ambassadors': 'Ambassadors',
    'nav.contact': 'Contact Us',
    'nav.cart': 'Cart',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.search': 'Search',

    // Footer
    'footer.copyright': '© 2024 Void Esports. All rights reserved.',
    'footer.allRightsReserved': 'All rights reserved.',
    'footer.aboutUs': 'About Us',
    'footer.contact': 'Contact',
    'footer.careers': 'Careers',

    // Language selector
    'language.selector': 'Language',
    'language.english': 'English',
    'language.spanish': 'Spanish',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.teams': 'Equipos',
    'nav.news': 'Noticias',
    'nav.placements': 'Colocaciones',
    'nav.schedule': 'Horario',
    'nav.liveStream': 'Transmisión en Vivo',
    'nav.shop': 'Tienda',
    'nav.about': 'Acerca de',
    'nav.ambassadors': 'Embajadores',
    'nav.contact': 'Contactanos',
    'nav.cart': 'Carrito',

    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.submit': 'Enviar',
    'common.close': 'Cerrar',
    'common.open': 'Abrir',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.search': 'Buscar',

    // Footer
    'footer.copyright': '© 2024 Void Esports. Todos los derechos reservados.',
    'footer.allRightsReserved': 'Todos los derechos reservados.',
    'footer.aboutUs': 'Acerca de',
    'footer.contact': 'Contactanos',
    'footer.careers': 'Carreras',

    // Language selector
    'language.selector': 'Idioma',
    'language.english': 'Inglés',
    'language.spanish': 'Español',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      setLanguage(savedLanguage);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    // Save language to localStorage when it changes
    if (mounted) {
      localStorage.setItem('language', language);

      // Update HTML lang attribute
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  const t = (key: keyof TranslationKeys): string => {
    return translations[language][key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
