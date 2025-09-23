'use client';

import { useState } from 'react';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useLanguage, Language } from '@/contexts/LanguageContext';

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

const languageOptions: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  const currentLanguage = languageOptions.find(lang => lang.code === language);

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-transparent border border-gray-600 rounded-lg hover:bg-white/10 hover:border-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('language.selector')}
      >
        <GlobeAltIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLanguage?.flag}</span>
        <span className="hidden sm:inline">{currentLanguage?.name}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1A] border border-gray-600 rounded-lg shadow-lg z-20 py-1">
            {languageOptions.map((option) => (
              <button
                key={option.code}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors duration-150 ${
                  language === option.code
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => handleLanguageChange(option.code)}
                role="option"
                aria-selected={language === option.code}
              >
                <span className="text-lg">{option.flag}</span>
                <span>{option.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
