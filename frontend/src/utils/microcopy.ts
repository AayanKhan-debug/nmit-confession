/**
 * Standard microcopy dictionary for NMIT Confessions.
 * Tone: Modern, collegiate, expressive, respectful, polished product feel.
 */

export const MICROCOPY = {
  brand: {
    title: 'NMIT Confessions',
    tagline: 'Anonymous Campus Voice',
    motto: 'No names. No cap. Truly anonymous.',
    privacyBadge: 'Zero tracking • Cryptographic anonymity',
  },
  feed: {
    title: 'Campus Feed',
    subtitle: 'What people are saying around NMIT right now.',
    emptyTitle: 'Silence in the corridors...',
    emptyDescription: 'No confessions match this filter yet. Be the first to drop one!',
    emptyCta: 'Drop a Confession',
  },
  submit: {
    title: 'Post a Confession',
    subtitle: 'Share your thoughts, stories, questions, or rants anonymously.',
    titlePlaceholder: 'Give your story a headline (optional)...',
    contentPlaceholder: 'Spill the campus tea respectfully. Minimum 10 characters required...',
    privacyNoticeTitle: 'Guaranteed Anonymous Submission',
    privacyNoticeDesc:
      'Your identity, IP address, and browser fingerprints are never stored or exposed. To maintain campus dignity, submissions undergo automated screening and moderation before publishing.',
    submittedTitle: 'Confession Sent to Queue',
    submittedDesc:
      'Your confession was received and queued for review. Once approved, it will go live on the campus feed.',
  },
  daily: {
    title: 'Confession of the Day',
    subtitle: 'The top campus voice selected for today.',
    emptyTitle: 'No Daily Pick Yet',
    emptyDescription:
      'The campus is still waking up! Once enough confessions are active today, one will be featured here.',
  },
  trending: {
    title: 'Trending Confessions',
    subtitle: 'The most talked-about confessions lighting up campus right now.',
    emptyTitle: 'Quiet day on campus',
    emptyDescription: 'No trending confessions yet. React to your favorite confessions to boost them!',
  },
  search: {
    title: 'Search Confessions',
    subtitle: 'Find past confessions by keyword or topic.',
    placeholder: 'Search keywords, hostels, exams, professors...',
    noResultsTitle: 'No matches found',
    noResultsDescription: 'Try different search keywords or browse the feed.',
  },
  reactions: {
    LOVE: { label: 'Love', emoji: '💖', verb: 'loved' },
    FUNNY: { label: 'Haha', emoji: '😂', verb: 'laughed' },
    SAD: { label: 'Sad', emoji: '😢', verb: 'sympathized' },
    FIRE: { label: 'Fire', emoji: '🔥', verb: 'hyped' },
  },
  errors: {
    genericTitle: 'Something hit a snag',
    genericDesc: 'Could not load data from the campus servers. Please give it another shot.',
    networkDesc: 'Connection error. Check your internet connection and retry.',
    unauthorized: 'You must be logged in as staff to access this section.',
  },
} as const;

export default MICROCOPY;
