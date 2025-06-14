import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Code } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 py-6 mt-12"
    >
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-400">
          <span>Made with</span>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-4 h-4 text-red-500 fill-current" />
          </motion.div>
          <span>and</span>
          <Code className="w-4 h-4" />
          <span>for better learning</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          © 2024 LearnSmart - Interactive Learning Platform
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;