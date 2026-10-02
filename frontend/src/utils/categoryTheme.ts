export interface CategoryTheme {
  key: string;
  label: string;
  emoji: string;
  accent: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeClass: string;
  selectedClass: string;
  leftBorderClass: string;
  glowClass: string;
}

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  ALL: {
    key: 'ALL',
    label: 'All',
    emoji: '✨',
    accent: '#8B5CF6',
    bgClass: 'bg-violet-500/10',
    textClass: 'text-violet-400',
    borderClass: 'border-violet-500/25',
    badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    selectedClass: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30 border-violet-400/40 font-bold',
    leftBorderClass: 'border-l-4 border-l-violet-500',
    glowClass: 'shadow-[inset_3px_0_0_0_#8B5CF6]',
  },
  CAMPUS_LIFE: {
    key: 'CAMPUS_LIFE',
    label: 'Campus Life',
    emoji: '🏫',
    accent: '#6366F1',
    bgClass: 'bg-indigo-500/10',
    textClass: 'text-indigo-400',
    borderClass: 'border-indigo-500/25',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    selectedClass: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30 border-indigo-400/40 font-bold',
    leftBorderClass: 'border-l-4 border-l-indigo-500',
    glowClass: 'shadow-[inset_3px_0_0_0_#6366F1]',
  },
  ADVICE: {
    key: 'ADVICE',
    label: 'Advice',
    emoji: '💡',
    accent: '#06B6D4',
    bgClass: 'bg-cyan-500/10',
    textClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/25',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    selectedClass: 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-500/30 border-cyan-400/40 font-bold',
    leftBorderClass: 'border-l-4 border-l-cyan-500',
    glowClass: 'shadow-[inset_3px_0_0_0_#06B6D4]',
  },
  RANT: {
    key: 'RANT',
    label: 'Rant',
    emoji: '🗣️',
    accent: '#F97316',
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-500/25',
    badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    selectedClass: 'bg-gradient-to-r from-orange-600 to-rose-600 text-white shadow-md shadow-orange-500/30 border-orange-400/40 font-bold',
    leftBorderClass: 'border-l-4 border-l-orange-500',
    glowClass: 'shadow-[inset_3px_0_0_0_#F97316]',
  },
  FUNNY: {
    key: 'FUNNY',
    label: 'Funny',
    emoji: '😂',
    accent: '#EAB308',
    bgClass: 'bg-yellow-500/10',
    textClass: 'text-yellow-400',
    borderClass: 'border-yellow-500/25',
    badgeClass: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    selectedClass: 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-md shadow-yellow-500/30 border-yellow-400/40 font-bold',
    leftBorderClass: 'border-l-4 border-l-yellow-500',
    glowClass: 'shadow-[inset_3px_0_0_0_#EAB308]',
  },
  CRUSH: {
    key: 'CRUSH',
    label: 'Crushes',
    emoji: '💖',
    accent: '#EC4899',
    bgClass: 'bg-pink-500/10',
    textClass: 'text-pink-400',
    borderClass: 'border-pink-500/25',
    badgeClass: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    selectedClass: 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/30 border-pink-400/40 font-bold',
    leftBorderClass: 'border-l-4 border-l-pink-500',
    glowClass: 'shadow-[inset_3px_0_0_0_#EC4899]',
  },
  OTHER: {
    key: 'OTHER',
    label: 'Other',
    emoji: '🔮',
    accent: '#A855F7',
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/25',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    selectedClass: 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-500/30 border-purple-400/40 font-bold',
    leftBorderClass: 'border-l-4 border-l-purple-500',
    glowClass: 'shadow-[inset_3px_0_0_0_#A855F7]',
  },
};

export const getCategoryTheme = (categoryKey?: string | null): CategoryTheme => {
  if (!categoryKey) return CATEGORY_THEMES.OTHER;
  return CATEGORY_THEMES[categoryKey] || {
    key: categoryKey,
    label: categoryKey.replace('_', ' '),
    emoji: '📌',
    accent: '#8B5CF6',
    bgClass: 'bg-violet-500/10',
    textClass: 'text-violet-400',
    borderClass: 'border-violet-500/25',
    badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    selectedClass: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30 border-violet-400/40 font-bold',
    leftBorderClass: 'border-l-4 border-l-violet-500',
    glowClass: 'shadow-[inset_3px_0_0_0_#8B5CF6]',
  };
};

export const ALL_CATEGORY_KEYS = [
  'ALL',
  'CAMPUS_LIFE',
  'ADVICE',
  'RANT',
  'FUNNY',
  'CRUSH',
  'OTHER',
] as const;

export const SUBMISSION_CATEGORY_KEYS = [
  'CAMPUS_LIFE',
  'ADVICE',
  'RANT',
  'FUNNY',
  'CRUSH',
  'OTHER',
] as const;
