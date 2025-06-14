import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, CheckCircle, XCircle, Award } from 'lucide-react';
import { QuizData, QuizAnswer, QuizResult } from '../types';
import LanguageSelector from './LanguageSelector';
import { translateText, SupportedLanguage } from '../services/translationService';

interface QuizSectionProps {
  currentTopic: string;
  quizData: QuizData | null;
  isLoading: boolean;
  onGenerateQuiz: (difficulty: string, language: SupportedLanguage) => void;
}

const QuizSection: React.FC<QuizSectionProps> = ({
  currentTopic,
  quizData,
  isLoading,
  onGenerateQuiz
}) => {
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [translatedQuiz, setTranslatedQuiz] = useState<QuizData | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translateQuiz = async () => {
      if (!quizData || selectedLanguage === 'en') {
        setTranslatedQuiz(null);
        return;
      }

      setIsTranslating(true);
      try {
        // Translate questions one by one to avoid overwhelming the API
        const translatedQuestions = [];
        for (const question of quizData.questions) {
          try {
            const translatedQuestion = await translateText(question.question, selectedLanguage);
            const translatedOptions = await Promise.all(
              question.options.map(option => translateText(option, selectedLanguage))
            );
            const translatedExplanation = await translateText(question.explanation, selectedLanguage);

            translatedQuestions.push({
              ...question,
              question: translatedQuestion,
              options: translatedOptions,
              explanation: translatedExplanation
            });
          } catch (error) {
            console.error('Error translating question:', error);
            // If translation fails for a question, keep the original
            translatedQuestions.push(question);
          }
        }

        setTranslatedQuiz({
          questions: translatedQuestions
        });
      } catch (error) {
        console.error('Quiz translation error:', error);
        setTranslatedQuiz(null);
        setSelectedLanguage('en');
      } finally {
        setIsTranslating(false);
      }
    };

    translateQuiz();
  }, [quizData, selectedLanguage]);

  const handleGenerateQuiz = () => {
    setAnswers([]);
    setShowResults(false);
    setQuizResult(null);
    setTranslatedQuiz(null);
    onGenerateQuiz(difficulty, selectedLanguage);
  };

  const handleAnswerSelect = (questionIndex: number, selectedOption: number) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionIndex === questionIndex);
      if (existing) {
        return prev.map(a => 
          a.questionIndex === questionIndex 
            ? { ...a, selectedOption }
            : a
        );
      }
      return [...prev, { questionIndex, selectedOption }];
    });
  };

  const handleSubmitQuiz = () => {
    const currentQuiz = translatedQuiz || quizData;
    if (!currentQuiz || answers.length !== currentQuiz.questions.length) {
      return;
    }

    let score = 0;
    answers.forEach(answer => {
      if (currentQuiz.questions[answer.questionIndex].correct_index === answer.selectedOption) {
        score++;
      }
    });

    const percentage = (score / currentQuiz.questions.length) * 100;
    let feedback = '';

    if (percentage >= 90) {
      feedback = 'Excellent! You have mastered this topic!';
    } else if (percentage >= 70) {
      feedback = 'Great job! You have a good understanding of the topic.';
    } else if (percentage >= 50) {
      feedback = 'Good effort! You\'re on the right track.';
    } else {
      feedback = 'Keep learning! This topic needs more study.';
    }

    setQuizResult({
      score,
      totalQuestions: currentQuiz.questions.length,
      percentage,
      feedback
    });
    setShowResults(true);
  };

  const displayQuiz = translatedQuiz || quizData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">Test Your Knowledge</h3>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              isTranslating={isTranslating}
            />
            <div className="flex items-center space-x-3">
              <label className="text-white text-sm font-medium">Difficulty:</label>
              <div className="relative">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="appearance-none bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  disabled={isLoading || isTranslating}
                >
                  <option value="easy" className="text-slate-800">Easy</option>
                  <option value="medium" className="text-slate-800">Medium</option>
                  <option value="hard" className="text-slate-800">Hard</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!displayQuiz && !isLoading && (
          <div className="text-center py-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateQuiz}
              disabled={!currentTopic}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>Generate Quiz</span>
              </div>
            </motion.button>
            {!currentTopic && (
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Please learn about a topic first
              </p>
            )}
          </div>
        )}

        {(isLoading || isTranslating) && (
          <div className="text-center py-8">
            <div className="flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-400">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <span>{isTranslating ? 'Translating quiz...' : 'Generating quiz questions...'}</span>
            </div>
          </div>
        )}

        {displayQuiz && !isLoading && !isTranslating && (
          <div className="space-y-6">
            {displayQuiz.questions.map((question, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
              >
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                  {index + 1}. {question.question}
                </h4>
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = answers.find(a => a.questionIndex === index)?.selectedOption === optionIndex;
                    const isCorrect = showResults && optionIndex === question.correct_index;
                    const isWrong = showResults && isSelected && optionIndex !== question.correct_index;

                    return (
                      <motion.button
                        key={optionIndex}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => !showResults && handleAnswerSelect(index, optionIndex)}
                        disabled={showResults}
                        className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        } ${
                          showResults
                            ? isCorrect
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                              : isWrong
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                              : ''
                            : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {showResults ? (
                            isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : isWrong ? (
                              <XCircle className="w-5 h-5 text-red-500" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded-full" />
                            )
                          ) : (
                            <div className={`w-5 h-5 border-2 rounded-full ${
                              isSelected
                                ? 'border-blue-500 dark:border-blue-400 bg-blue-500 dark:bg-blue-400'
                                : 'border-slate-300 dark:border-slate-600'
                            }`} />
                          )}
                          <span className={`text-slate-700 dark:text-slate-300 ${
                            showResults && (isCorrect || isWrong) ? 'font-medium' : ''
                          }`}>
                            {option}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {question.explanation}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}

            {!showResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center pt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitQuiz}
                  disabled={answers.length !== displayQuiz.questions.length}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
                >
                  Submit Answers
                </motion.button>
              </motion.div>
            )}

            {showResults && quizResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  {quizResult.percentage}% Score
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {quizResult.score} out of {quizResult.totalQuestions} correct
                </p>
                <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-8">
                  {quizResult.feedback}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateQuiz}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
                >
                  Try Another Quiz
                </motion.button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default QuizSection;