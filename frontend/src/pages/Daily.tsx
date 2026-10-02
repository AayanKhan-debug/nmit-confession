import { useState, useEffect } from 'react';
import { getDailyConfession } from '../api';
import type { Confession } from '../types';
import {
  Calendar,
  Sparkles,
  Heart,
  Smile,
  Frown,
  Flame,
  Clock,
  Sun
} from 'lucide-react';
import {
  Badge,
  SkeletonCard,
  EmptyState,
  ErrorState
} from '../components/ui';


const CATEGORY_BADGE_VARIANTS: Record<string, { variant: 'violet' | 'pink' | 'blue' | 'success' | 'warning' | 'default'; label: string; emoji: string }> = {
  CAMPUS_LIFE: { variant: 'blue', label: 'Campus Life', emoji: '🏫' },
  ADVICE: { variant: 'success', label: 'Advice', emoji: '💡' },
  RANT: { variant: 'pink', label: 'Rant', emoji: '🗣️' },
  FUNNY: { variant: 'warning', label: 'Funny', emoji: '😂' },
  CRUSH: { variant: 'pink', label: 'Crush', emoji: '💖' },
  OTHER: { variant: 'default', label: 'Other', emoji: '🔮' },
};

export default function Daily() {
  const [confession, setConfession] = useState<Confession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    executeLoad();
  }, []);

  const executeLoad = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDailyConfession();
      setConfession(res.data);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setConfession(null);
      } else {
        setError('Failed to fetch the Confession of the Day. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getReactions = (c: Confession) => {
    const r = c.reactions || {};
    return {
      love: r.LOVE ?? c.reactionLoveCount ?? 0,
      funny: r.FUNNY ?? c.reactionFunnyCount ?? 0,
      sad: r.SAD ?? c.reactionSadCount ?? 0,
      fire: r.FIRE ?? c.reactionFireCount ?? 0,
      total: (r.LOVE || 0) + (r.FUNNY || 0) + (r.SAD || 0) + (r.FIRE || 0)
    };
  };

  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 via-violet-500/5 to-transparent rounded-bl-full pointer-events-none -mr-10 -mt-10" />

        <div className="relative z-10 space-y-2">
          <Badge variant="warning" dot size="sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Daily Selection</span>
            </span>
          </Badge>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Today's Confession
          </h1>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-1 font-semibold text-[var(--text-primary)]">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{todayFormatted}</span>
            </div>
            <span>•</span>
            <span className="text-[var(--text-muted)]">
              Selected deterministically for today's date
            </span>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div>
        {loading ? (
          <SkeletonCard className="p-8 sm:p-10 border-amber-500/30" />
        ) : error ? (
          <ErrorState
            title="Failed to load daily feature"
            message={error}
            onRetry={executeLoad}
          />
        ) : !confession ? (
          <EmptyState
            icon={<Sun className="w-8 h-8 text-amber-500" />}
            title="Today's slot is still empty"
            description="Today's featured confession is selected deterministically for this date. Check back once confessions are published today!"
            actionLabel="Post a Confession"
            onAction={() => { window.location.href = '/submit'; }}
          />
        ) : (
          (() => {
            const badgeMeta = CATEGORY_BADGE_VARIANTS[confession.category] || CATEGORY_BADGE_VARIANTS.OTHER;
            const rx = getReactions(confession);

            return (
              <article className="relative rounded-3xl bg-[var(--bg-surface)] border-2 border-amber-500/30 p-7 sm:p-10 shadow-lg shadow-amber-500/5 overflow-hidden">
                {/* Spotlight ribbon */}
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[11px] font-extrabold px-4 py-1.5 rounded-bl-2xl shadow-sm flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 fill-white/30" />
                  <span>Spotlight</span>
                </div>

                {/* Card Top: Category and Post Date */}
                <div className="flex items-center gap-2.5 mb-5">
                  <Badge variant={badgeMeta.variant} size="md">
                    <span className="mr-1">{badgeMeta.emoji}</span>
                    <span>{badgeMeta.label}</span>
                  </Badge>

                  <span className="text-xs text-[var(--text-muted)]">
                    Posted on {new Date(confession.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Confession Title */}
                {confession.title && (
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] mb-3 leading-snug">
                    {confession.title}
                  </h2>
                )}

                {/* Confession Body */}
                <p className="text-[var(--text-secondary)] whitespace-pre-wrap text-base sm:text-lg leading-relaxed mb-8">
                  {confession.content}
                </p>

                {/* Reactions Footnote & Deterministic Disclaimer */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[var(--border-subtle)]">
                  {/* Reaction counts */}
                  <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      <Heart className="w-3.5 h-3.5" />
                      <span>{rx.love}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Smile className="w-3.5 h-3.5" />
                      <span>{rx.funny}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
                      <Frown className="w-3.5 h-3.5" />
                      <span>{rx.sad}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{rx.fire}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--text-muted)] italic">
                    Selected deterministically for today's date.
                  </p>
                </div>
              </article>
            );
          })()
        )}
      </div>
    </div>
  );
}
