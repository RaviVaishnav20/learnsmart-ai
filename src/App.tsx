import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import TopicInput from './components/TopicInput';
import ContentSection from './components/ContentSection';
import QuizSection from './components/QuizSection';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import Toast from './components/Toast';
import APIKeyModal from './components/APIKeyModal';
import { LearningContent, QuizData, ToastMessage } from './types';
import { 
  initializeAI, 
  isAIInitialized, 
  generateTopicExplanation, 
  generateTopicAnalogy, 
  generateQuiz 
} from './services/aiService';
import { initializeTranslationService, SupportedLanguage } from './services/translationService';

function App() {
  const [currentTopic, setCurrentTopic] = useState('');
  const [content, setContent] = useState<LearningContent | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    // Check if API key is already stored
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      const aiSuccess = initializeAI(savedApiKey);
      const translationSuccess = initializeTranslationService(savedApiKey);
      
      if (!aiSuccess || !translationSuccess) {
        showToast('Failed to initialize services. Please reconfigure your API key.', 'error');
        setShowAPIKeyModal(true);
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAPIKeySubmit = (apiKey: string) => {
    const aiSuccess = initializeAI(apiKey);
    const translationSuccess = initializeTranslationService(apiKey);
    
    if (aiSuccess && translationSuccess) {
      localStorage.setItem('gemini_api_key', apiKey);
      setShowAPIKeyModal(false);
      showToast('API key configured successfully!');
    } else {
      showToast('Failed to initialize services. Please check your API key.', 'error');
    }
  };

  const handleLearnTopic = async (topic: string) => {
    if (!topic.trim()) {
      showToast('Please enter a topic to learn about.', 'warning');
      return;
    }

    if (!isAIInitialized()) {
      setShowAPIKeyModal(true);
      return;
    }

    setCurrentTopic(topic);
    setIsLoading(true);
    setContent(null);
    setQuizData(null);

    try {
      // Generate content in parallel
      const [explanation, analogy] = await Promise.all([
        generateTopicExplanation(topic),
        generateTopicAnalogy(topic)
      ]);

      const learningContent: LearningContent = {
        topic,
        explanation,
        analogy
      };

      setContent(learningContent);
      showToast('Content generated successfully!');
    } catch (error) {
      console.error('Error generating content:', error);
      if (error instanceof Error && error.message.includes('API key')) {
        setShowAPIKeyModal(true);
        showToast('Please configure your API key to continue.', 'warning');
      } else {
        showToast('Failed to generate content. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuiz = async (difficulty: string, language: SupportedLanguage) => {
    if (!currentTopic) {
      showToast('Please learn about a topic first.', 'warning');
      return;
    }

    if (!isAIInitialized()) {
      setShowAPIKeyModal(true);
      return;
    }

    setIsQuizLoading(true);
    setQuizData(null);

    try {
      const questions = await generateQuiz(currentTopic, difficulty);
      
      const quiz: QuizData = {
        questions: questions
      };

      setQuizData(quiz);
      showToast('Quiz generated successfully!');
    } catch (error) {
      console.error('Error generating quiz:', error);
      if (error instanceof Error && error.message.includes('API key')) {
        setShowAPIKeyModal(true);
        showToast('Please configure your API key to continue.', 'warning');
      } else {
        showToast('Failed to generate quiz. Please try again.', 'error');
      }
    } finally {
      setIsQuizLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <div className="flex flex-col min-h-screen">
        <Header theme={theme} onToggleTheme={toggleTheme} />
        
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <TopicInput onLearnTopic={handleLearnTopic} isLoading={isLoading} />
            
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <LoadingSpinner message="Generating personalized content..." />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {content && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="space-y-6"
                >
                  <ContentSection content={content} />
                  <QuizSection
                    currentTopic={currentTopic}
                    quizData={quizData}
                    isLoading={isQuizLoading}
                    onGenerateQuiz={(difficulty) => handleGenerateQuiz(difficulty, 'en')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>

        <Footer />
      </div>

      <APIKeyModal
        isOpen={showAPIKeyModal}
        onClose={() => setShowAPIKeyModal(false)}
        onSubmit={handleAPIKeySubmit}
      />

      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;