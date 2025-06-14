import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle
  };

  const colors = {
    success: 'from-emerald-500 to-teal-600',
    error: 'from-red-500 to-rose-600',
    warning: 'from-amber-500 to-orange-600'
  };

  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className={`bg-gradient-to-r ${colors[type]} text-white px-6 py-4 rounded-xl shadow-2xl border border-white/20 backdrop-blur-sm max-w-sm`}>
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium flex-1">{message}</p>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Toast;