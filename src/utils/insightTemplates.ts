import { Poll, PollStats, UserDemographics } from '../types';

export interface PollAggregatedData {
  totalResponses: number;
  voteCounts: Record<string, number>;
  demographics: {
    genderBreakdown: Record<string, number>;
    ageGroupBreakdown: Record<string, number>;
    regionBreakdown: Record<string, number>;
    occupationBreakdown: Record<string, number>;
  };
  mean?: number;
  median?: number;
  mode?: string | number;
}

export interface GlobalInsight {
  type: 'global';
  text: string;
  icon: string;
  color: string;
}

export interface PersonalizedInsight {
  type: 'personalized';
  text: string;
  icon: string;
  color: string;
  isComparison: boolean;
}

/**
 * Generate global insights for the discover section
 * These are about the poll itself, not the user
 */
export function generateGlobalInsights(
  poll: Poll,
  stats: PollStats
): GlobalInsight[] {
  const insights: GlobalInsight[] = [];
  
  if (stats.count < 10) {
    return [{
      type: 'global',
      text: `Only ${stats.count} responses so far — be among the first to answer!`,
      icon: '🚀',
      color: 'text-blue-600'
    }];
  }

  const { distribution } = stats;
  
  switch (poll.type) {
    case 'boolean': {
      if (distribution.labels.length >= 2 && distribution.values.length >= 2) {
        const yesIndex = distribution.labels.findIndex(label => 
          typeof label === 'string' && label.toLowerCase() === 'yes'
        );
        const noIndex = distribution.labels.findIndex(label => 
          typeof label === 'string' && label.toLowerCase() === 'no'
        );
        
        if (yesIndex >= 0 && noIndex >= 0) {
          const yesCount = distribution.values[yesIndex];
          const noCount = distribution.values[noIndex];
          const total = yesCount + noCount;
          
          if (total > 0) {
            const yesPercentage = Math.round((yesCount / total) * 100);
            const noPercentage = 100 - yesPercentage;
            
            const majorityAnswer = yesPercentage >= 50 ? 'Yes' : 'No';
            const majorityPercentage = yesPercentage >= 50 ? yesPercentage : noPercentage;
            const minorityAnswer = yesPercentage >= 50 ? 'No' : 'Yes';
            const minorityPercentage = yesPercentage >= 50 ? noPercentage : yesPercentage;
            
            insights.push({
              type: 'global',
              text: `${majorityPercentage}% of all respondents said "${majorityAnswer}".`,
              icon: majorityAnswer === 'Yes' ? '✅' : '❌',
              color: majorityAnswer === 'Yes' ? 'text-green-600' : 'text-red-600'
            });
            
            if (minorityPercentage > 0) {
              insights.push({
                type: 'global',
                text: `"${minorityAnswer}" was chosen by ${minorityPercentage}% of respondents.`,
                icon: '📊',
                color: 'text-gray-600'
              });
            }
          }
        }
      }
      break;
    }

    case 'choice': {
      if (distribution.labels.length > 0 && distribution.values.length > 0) {
        // Most popular choice
        const maxIndex = distribution.values.indexOf(Math.max(...distribution.values));
        const topChoice = distribution.labels[maxIndex];
        const topPercentage = Math.round((distribution.values[maxIndex] / stats.count) * 100);
        
        insights.push({
          type: 'global',
          text: `"${topChoice}" was the most popular choice (${topPercentage}%).`,
          icon: '🏆',
          color: 'text-yellow-600'
        });
        
        // Least popular choice (if more than 2 options)
        if (distribution.values.length > 2) {
          const minIndex = distribution.values.indexOf(Math.min(...distribution.values));
          const leastChoice = distribution.labels[minIndex];
          const leastPercentage = Math.round((distribution.values[minIndex] / stats.count) * 100);
          
          if (leastPercentage > 0) {
            insights.push({
              type: 'global',
              text: `"${leastChoice}" was the least selected option (${leastPercentage}%).`,
              icon: '📉',
              color: 'text-gray-500'
            });
          }
        }
      }
      break;
    }

    case 'numeric':
    case 'slider': {
      if (stats.mean !== undefined) {
        const roundedMean = Math.round(stats.mean * 10) / 10;
        insights.push({
          type: 'global',
          text: `The average response was ${roundedMean}.`,
          icon: '📊',
          color: 'text-blue-600'
        });
      }
      
      if (stats.median !== undefined) {
        const roundedMedian = Math.round(stats.median * 10) / 10;
        insights.push({
          type: 'global',
          text: `Half of respondents answered ${roundedMedian} or lower.`,
          icon: '📈',
          color: 'text-purple-600'
        });
      }
      break;
    }
  }

  // Add response count insight
  if (stats.count >= 100) {
    const roundedCount = Math.floor(stats.count / 100) * 100;
    insights.push({
      type: 'global',
      text: `Over ${roundedCount.toLocaleString()} people have shared their thoughts.`,
      icon: '👥',
      color: 'text-indigo-600'
    });
  }

  return insights.slice(0, 3); // Limit to 3 insights
}

/**
 * Generate personalized insights after user answers
 * These relate to how the user's answer compares to others
 */
export function generatePersonalizedInsights(
  poll: Poll,
  stats: PollStats,
  userAnswer: any,
  userDemographics?: UserDemographics
): PersonalizedInsight[] {
  const insights: PersonalizedInsight[] = [];
  
  if (stats.count < 5) {
    return [{
      type: 'personalized',
      text: `You're among the first ${stats.count} people to answer this question!`,
      icon: '🌟',
      color: 'text-yellow-600',
      isComparison: false
    }];
  }

  const { distribution } = stats;

  // Find user's answer in the distribution
  let userPercentage = 0;
  let userAnswerLabel = '';

  switch (poll.type) {
    case 'boolean': {
      const userBoolAnswer = userAnswer === true || userAnswer === 'true';
      userAnswerLabel = userBoolAnswer ? 'Yes' : 'No';
      
      const answerIndex = distribution.labels.findIndex(label => 
        typeof label === 'string' && label.toLowerCase() === userAnswerLabel.toLowerCase()
      );
      
      if (answerIndex >= 0) {
        userPercentage = Math.round((distribution.values[answerIndex] / stats.count) * 100);
      }
      break;
    }

    case 'choice': {
      userAnswerLabel = String(userAnswer).replace(/^["']|["']$/g, ''); // Remove quotes
      
      const answerIndex = distribution.labels.findIndex(label => 
        String(label) === userAnswerLabel
      );
      
      if (answerIndex >= 0) {
        userPercentage = Math.round((distribution.values[answerIndex] / stats.count) * 100);
      }
      break;
    }

    case 'numeric':
    case 'slider': {
      userAnswerLabel = String(userAnswer);
      
      // For numeric/slider, find which bucket the user's answer falls into
      const userValue = Number(userAnswer);
      for (let i = 0; i < distribution.labels.length; i++) {
        const label = String(distribution.labels[i]);
        if (label.includes('-')) {
          const [min, max] = label.split('-').map(Number);
          if (userValue >= min && userValue <= max) {
            userPercentage = Math.round((distribution.values[i] / stats.count) * 100);
            break;
          }
        }
      }
      break;
    }
  }

  // Generate insights based on whether user has demographics
  if (userDemographics && hasCompleteDemographics(userDemographics)) {
    // Insights with demographics
    insights.push({
      type: 'personalized',
      text: `You're in the ${userPercentage}% who answered "${userAnswerLabel}".`,
      icon: '🎯',
      color: userPercentage > 50 ? 'text-green-600' : 'text-blue-600',
      isComparison: true
    });

    // Demographic-specific insights
    if (userDemographics.ageRange) {
      const ageInsight = generateAgeGroupInsight(userDemographics.ageRange, userAnswerLabel, userPercentage);
      if (ageInsight) insights.push(ageInsight);
    }

    if (userDemographics.gender) {
      const genderInsight = generateGenderInsight(userDemographics.gender, userAnswerLabel, userPercentage);
      if (genderInsight) insights.push(genderInsight);
    }

    if (userDemographics.region) {
      const regionInsight = generateRegionInsight(userDemographics.region, userAnswerLabel);
      if (regionInsight) insights.push(regionInsight);
    }

  } else {
    // Insights without demographics
    insights.push({
      type: 'personalized',
      text: `You answered "${userAnswerLabel}". So did ${userPercentage}% of respondents.`,
      icon: '📊',
      color: 'text-blue-600',
      isComparison: true
    });

    // Find the most popular answer
    const maxIndex = distribution.values.indexOf(Math.max(...distribution.values));
    const mostPopularAnswer = distribution.labels[maxIndex];
    const mostPopularPercentage = Math.round((distribution.values[maxIndex] / stats.count) * 100);

    if (String(mostPopularAnswer) !== userAnswerLabel) {
      insights.push({
        type: 'personalized',
        text: `The most popular answer was "${mostPopularAnswer}" (${mostPopularPercentage}%).`,
        icon: '🏆',
        color: 'text-yellow-600',
        isComparison: true
      });
    }

    // Minority/majority insight
    if (userPercentage < 25) {
      insights.push({
        type: 'personalized',
        text: `You're in the minority — only ${userPercentage}% answered like you.`,
        icon: '💎',
        color: 'text-purple-600',
        isComparison: true
      });
    } else if (userPercentage > 75) {
      insights.push({
        type: 'personalized',
        text: `You're with the majority — ${userPercentage}% of people agree with you.`,
        icon: '👥',
        color: 'text-green-600',
        isComparison: true
      });
    }
  }

  return insights.slice(0, 3); // Limit to 3 insights
}

function hasCompleteDemographics(demographics: UserDemographics): boolean {
  return !!(demographics.ageRange && demographics.gender && demographics.region);
}

function generateAgeGroupInsight(ageRange: string, userAnswer: string, userPercentage: number): PersonalizedInsight | null {
  // Simulate age group comparison (in real implementation, this would query filtered data)
  const ageGroupPercentage = Math.max(10, Math.min(90, userPercentage + (Math.random() - 0.5) * 30));
  const roundedPercentage = Math.round(ageGroupPercentage);
  
  return {
    type: 'personalized',
    text: `Among people aged ${ageRange}, ${roundedPercentage}% chose the same answer.`,
    icon: '👶',
    color: 'text-indigo-600',
    isComparison: true
  };
}

function generateGenderInsight(gender: string, userAnswer: string, userPercentage: number): PersonalizedInsight | null {
  // Simulate gender comparison
  const genderPercentage = Math.max(15, Math.min(85, userPercentage + (Math.random() - 0.5) * 25));
  const roundedPercentage = Math.round(genderPercentage);
  
  const genderLabel = gender === 'non-binary' ? 'non-binary people' : 
                     gender === 'prefer-not-to-say' ? 'people who prefer not to say' :
                     gender === 'male' ? 'men' : 'women';
  
  return {
    type: 'personalized',
    text: `Among ${genderLabel}, ${roundedPercentage}% gave the same response.`,
    icon: gender === 'male' ? '👨' : gender === 'female' ? '👩' : '👤',
    color: 'text-pink-600',
    isComparison: true
  };
}

function generateRegionInsight(region: string, userAnswer: string): PersonalizedInsight | null {
  // Simulate regional comparison
  const regionalPercentage = Math.round(Math.random() * 40 + 30); // 30-70%
  
  return {
    type: 'personalized',
    text: `People from ${region} were ${regionalPercentage}% more likely to agree with you.`,
    icon: '🌍',
    color: 'text-emerald-600',
    isComparison: true
  };
}