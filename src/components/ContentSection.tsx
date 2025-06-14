import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, Lightbulb, Copy, Check } from 'lucide-react';
import { LearningContent } from '../types';
import LanguageSelector from './LanguageSelector';
import { translateText, SupportedLanguage } from '../services/translationService';

interface ContentSectionProps {
  content: LearningContent;
}

const ContentSection: React.FC<ContentSectionProps> = ({ content }) => {
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<LearningContent | null>(null);

  useEffect(() => {
    const translateContent = async () => {
      if (selectedLanguage === 'en') {
        setTranslatedContent(null);
        return;
      }

      setIsTranslating(true);
      try {
        // Check if translation service is initialized
        const savedApiKey = localStorage.getItem('gemini_api_key');
        if (!savedApiKey) {
          throw new Error('Translation service not initialized. Please provide your API key.');
        }

        const translatedExplanation = await translateText(content.explanation, selectedLanguage);
        const translatedAnalogy = await translateText(content.analogy, selectedLanguage);

        setTranslatedContent({
          topic: content.topic,
          explanation: translatedExplanation,
          analogy: translatedAnalogy
        });
      } catch (error) {
        console.error('Translation error:', error);
        // Keep the original content if translation fails
        setTranslatedContent(null);
        // Reset to English if translation fails
        setSelectedLanguage('en');
      } finally {
        setIsTranslating(false);
      }
    };

    translateContent();
  }, [content, selectedLanguage]);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const displayContent = translatedContent || content;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Explanation Section */}
      <motion.div
        variants={itemVariants}
        className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Understanding the Topic</h3>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
                isTranslating={isTranslating}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => copyToClipboard(displayContent.explanation, 'explanation')}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200"
                aria-label="Copy explanation"
              >
                {copiedSection === 'explanation' ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <Copy className="w-4 h-4 text-white" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-strong:text-slate-800 dark:prose-strong:text-slate-100 prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayContent.explanation}
            </ReactMarkdown>
          </div>
        </div>
      </motion.div>

      {/* Analogy Section */}
      <motion.div
        variants={itemVariants}
        className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Real-world Analogy</h3>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
                isTranslating={isTranslating}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => copyToClipboard(displayContent.analogy, 'analogy')}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200"
                aria-label="Copy analogy"
              >
                {copiedSection === 'analogy' ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <Copy className="w-4 h-4 text-white" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-strong:text-slate-800 dark:prose-strong:text-slate-100 prose-code:text-emerald-600 dark:prose-code:text-emerald-400 prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayContent.analogy}
            </ReactMarkdown>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContentSection;