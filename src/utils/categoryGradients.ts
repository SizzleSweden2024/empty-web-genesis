/**
 * Generates very subtle gradient backgrounds for poll categories
 * Uses white backgrounds with barely noticeable hues
 */

// Light mode gradient colors (white with extremely subtle tints)
const lightGradients = [
  ['#ffffff', '#fffefb'], // Pure white to warm white
  ['#ffffff', '#fafbff'], // Pure white to cool white
  ['#ffffff', '#fbfffe'], // Pure white to mint white
  ['#ffffff', '#fffafd'], // Pure white to pink white
  ['#ffffff', '#fffffa'], // Pure white to yellow white
  ['#ffffff', '#fcfcff'], // Pure white to gray white
  ['#ffffff', '#fefaff'], // Pure white to purple white
  ['#ffffff', '#f9fffc'], // Pure white to green white
  ['#ffffff', '#fffcf9'], // Pure white to peach white
  ['#ffffff', '#f9ffff'], // Pure white to teal white
];

// Dark mode gradient colors (very dark with subtle tints)
const darkGradients = [
  ['#1a1a1a', '#1b1a19'], // Dark with warm tint
  ['#1a1a1a', '#191a1b'], // Dark with cool tint
  ['#1a1a1a', '#1a1b1a'], // Dark with green tint
  ['#1a1a1a', '#1b191b'], // Dark with purple tint
  ['#1a1a1a', '#1b1a19'], // Dark with orange tint
  ['#1a1a1a', '#1a1a1a'], // Pure dark
  ['#1a1a1a', '#1b191a'], // Dark with violet tint
  ['#1a1a1a', '#191b1a'], // Dark with forest tint
  ['#1a1a1a', '#1b1919'], // Dark with rust tint
  ['#1a1a1a', '#191b1b'], // Dark with teal tint
];

/**
 * Simple hash function to generate consistent index from string
 */
const hashString = (str: string): number => {
  let hash = 0;
  if (!str) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash);
};

/**
 * Gets a very subtle gradient background for a given category
 */
export const getCategoryGradient = (category?: string, isDarkMode: boolean = false): string => {
  if (!category) {
    // Default pure white or pure dark for unknown categories
    const defaultColor = isDarkMode ? '#1a1a1a' : '#ffffff';
    return defaultColor;
  }

  const gradients = isDarkMode ? darkGradients : lightGradients;
  const index = hashString(category.toLowerCase()) % gradients.length;
  const [color1, color2] = gradients[index];
  
  return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
};

/**
 * Gets category-specific accent color for borders, text, etc.
 */
export const getCategoryAccentColor = (category?: string, isDarkMode: boolean = false): string => {
  if (!category) {
    return isDarkMode ? '#6b7280' : '#9ca3af';
  }

  // Accent colors that work well with the gradients
  const lightAccents = [
    '#ea580c', // Orange
    '#0284c7', // Blue
    '#16a34a', // Green
    '#dc2626', // Red
    '#ca8a04', // Yellow
    '#6b7280', // Gray
    '#9333ea', // Purple
    '#059669', // Emerald
    '#f97316', // Orange
    '#0d9488', // Teal
  ];

  const darkAccents = [
    '#fb923c', // Light orange
    '#38bdf8', // Light blue
    '#4ade80', // Light green
    '#f87171', // Light red
    '#fbbf24', // Light yellow
    '#9ca3af', // Light gray
    '#a855f7', // Light purple
    '#34d399', // Light emerald
    '#fb923c', // Light orange
    '#2dd4bf', // Light teal
  ];

  const accents = isDarkMode ? darkAccents : lightAccents;
  const index = hashString(category.toLowerCase()) % accents.length;
  
  return accents[index];
};