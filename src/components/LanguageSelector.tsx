import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../services/translationService';

interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  isTranslating: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  isTranslating
}) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-white/20 rounded-lg">
        <Globe className="w-5 h-5 text-white" />
      </div>
      <div className="relative">
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
          disabled={isTranslating}
          className="appearance-none bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
            <option key={code} value={code} className="text-slate-800">
              {name}
            </option>
          ))}
        </select>
        <motion.div
          animate={{ rotate: isTranslating ? 360 : 0 }}
          transition={{ duration: 1, repeat: isTranslating ? Infinity : 0, ease: "linear" }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none"
        >
          {isTranslating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <div className="w-4 h-4 border-2 border-white rounded-full" />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LanguageSelector; 