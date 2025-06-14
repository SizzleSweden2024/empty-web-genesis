import React from 'react';
import { ArrowUp } from 'lucide-react';
import { useScrollToTop } from '../hooks/useScrollToTop';

const ScrollToTopButton: React.FC = () => {
  const { isVisible, scrollToTop } = useScrollToTop();

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} />
    </button>
  );
};

export default ScrollToTopButton;