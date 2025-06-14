import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';

interface TopicInputProps {
  onLearnTopic: (topic: string) => void;
  isLoading: boolean;
}

const TopicInput: React.FC<TopicInputProps> = ({ onLearnTopic, isLoading }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLearnTopic(topic);
  };

  const suggestedTopics = [
    'Quantum Physics',
    'Machine Learning',
    'Blockchain Technology',
    'Climate Change',
    'Artificial Intelligence',
    'Space Exploration'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          What would you like to learn today?
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Enter any topic and get personalized explanations, analogies, and quizzes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic (e.g., Quantum Physics, Machine Learning...)"
            className="w-full pl-12 pr-4 py-4 text-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 dark:text-slate-100"
            disabled={isLoading}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 text-lg disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating Content...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Start Learning</span>
            </div>
          )}
        </motion.button>
      </form>

      <div className="mt-8">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 text-center">
          Or try one of these popular topics:
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestedTopics.map((suggestedTopic) => (
            <motion.button
              key={suggestedTopic}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTopic(suggestedTopic)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors duration-200"
              disabled={isLoading}
            >
              {suggestedTopic}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TopicInput;