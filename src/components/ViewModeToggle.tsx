import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Smartphone } from 'lucide-react';
import { ViewMode } from '../hooks/useViewMode';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onToggle: () => void;
  className?: string;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, onToggle, className = '' }) => {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`p-2 rounded-lg transition-colors ${
        viewMode === 'swipe' 
          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
          : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      } ${className}`}
      title={`Switch to ${viewMode === 'swipe' ? 'standard' : 'swipe'} view`}
    >
      {viewMode === 'swipe' ? (
        <Smartphone className="h-5 w-5" />
      ) : (
        <Layers className="h-5 w-5" />
      )}
    </motion.button>
  );
};

export default ViewModeToggle;