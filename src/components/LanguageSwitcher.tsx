import React from 'react';
import type { Language } from '../types';

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  disabled: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLanguage, onLanguageChange, disabled }) => {
  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' },
  ];

  const baseClasses = "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 transition-colors duration-200 w-24";
  const activeClasses = "bg-cyan-600 text-white shadow";
  const inactiveClasses = "bg-gray-700 text-gray-300 hover:bg-gray-600";
  const disabledClasses = "disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed";

  return (
    <div className="flex space-x-2 p-1 bg-gray-800 rounded-lg" role="radiogroup" aria-label="Language selection">
      {languages.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => onLanguageChange(code)}
          disabled={disabled}
          className={`${baseClasses} ${currentLanguage === code ? activeClasses : inactiveClasses} ${disabledClasses}`}
          aria-pressed={currentLanguage === code}
          role="radio"
          aria-checked={currentLanguage === code}
        >
          {label}
        </button>
      ))}
    </div>
  );
};