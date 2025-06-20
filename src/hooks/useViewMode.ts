import { useState, useEffect } from 'react';

export type ViewMode = 'standard' | 'swipe';

export const useViewMode = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Check if mobile device
    const isMobile = window.innerWidth < 768;
    
    // Get saved preference or default to swipe on mobile
    const saved = localStorage.getItem('viewMode') as ViewMode;
    return saved || (isMobile ? 'swipe' : 'standard');
  });

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'standard' ? 'swipe' : 'standard');
  };

  return { viewMode, setViewMode, toggleViewMode };
};