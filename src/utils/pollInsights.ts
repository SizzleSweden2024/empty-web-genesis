// This file is deprecated - insights are now handled by insightTemplates.ts
// Keeping for backward compatibility during migration

export interface PollInsight {
  value: string;
  description: string;
  color: string;
  hasData: boolean;
}

// Legacy function - use insightTemplates.ts instead
export const generatePollInsight = async (): Promise<PollInsight> => {
  return {
    value: '0',
    description: 'Legacy function - use insightTemplates.ts',
    color: 'gray',
    hasData: false
  };
};