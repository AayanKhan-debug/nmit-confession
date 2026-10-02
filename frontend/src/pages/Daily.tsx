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
  Sun,
  Shield,
  Share2,
  Check
} from 'lucide-react';
import {
  SkeletonCard,
  EmptyState,
  ErrorState,
  Button
} from '../components/ui';
import { getCategoryTheme } from '../utils/categoryTheme';

export default function Daily() {
  const [confession, setConfession] = useState<Confession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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

  const handleShare = async () => {
    if (!confession) return;
    try {
      const shareUrl = `${window.location.origin}/daily`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
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
      <section className="rounded-[24px] bg-[#111827]/85 backdrop-blur-md border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/20 via-violet-500/10 to-transparent rounded-full blur-2xl pointer-events-none -mr-12 -mt-12" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide uppercase select-none shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Featured Spotlight</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-heading">
            Confession of the Day
          </h1>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{todayFormatted}</span>
            </div>
            <span>•</span>
            <span className="text-slate-400">
              Selected deterministically for today's campus edition
            </span>
          </div>
        </div>
      </section>

      {/* Featured Card Area */}
      <div>
        {loading ? (
          <SkeletonCard className="p-8 sm:p-10 border-amber-500/40 shadow-amber-500/10" />
        ) : error ? (
          <ErrorState
            title="Failed to load daily feature"
            message={error}
            onRetry={executeLoad}
          />
        ) : !confession ? (
          <EmptyState
            icon={<Sun className="w-8 h-8 text-amber-400" />}
            title="Today's slot is still open"
            description="Today's featured confession is chosen deterministically from approved stories. Check back once confessions are published today!"
            actionLabel="Post a Confession"
            onAction={() => { window.location.href = '/submit'; }}
          />
        ) : (
          (() => {
            const theme = getCategoryTheme(confession.category);
            const rx = getReactions(confession);

            return (
              <article className="relative rounded-[24px] bg-gradient-to-b from-[#151d30] to-[#101726] border-2 border-amber-400/40 p-7 sm:p-10 shadow-2xl shadow-amber-500/10 overflow-hidden">
                {/* Spotlight Ambient Glow */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/15 via-pink-500/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

                {/* Spotlight Ribbon Banner */}
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 via-amber-600 to-orange-600 text-white text-[11px] font-black px-4.5 py-1.5 rounded-bl-2xl shadow-md flex items-center gap-1.5 uppercase tracking-wider border-b border-l border-amber-300/30">
                  <Sparkles className="w-3.5 h-3.5 fill-white/40" />
                  <span>Campus Spotlight</span>
                </div>

                {/* Card Top: Category Sticker & Anonymous Tag */}
                <div className="flex flex-wrap items-center gap-2.5 mb-5 relative z-10">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border tracking-wide select-none ${theme.badgeClass}`}
                  >
                    <span role="img" aria-hidden="true">{theme.emoji}</span>
                    <span>{theme.label}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-slate-400 border border-white/5 select-none">
                    <Shield className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Anonymous Story</span>
                  </span>

                  <span className="text-xs text-slate-400 ml-1">
                    Posted on {new Date(confession.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Confession Title */}
                {confession.title && (
                  <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white mb-4 leading-snug font-heading relative z-10">
                    {confession.title}
                  </h2>
                )}

                {/* Confession Body */}
                <p className="text-slate-100 whitespace-pre-wrap text-base sm:text-lg leading-relaxed mb-8 relative z-10 break-words">
                  {confession.content}
                </p>

                {/* Reactions Footnote & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-white/10 relative z-10">
                  {/* Reaction Summary Pills */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 select-none">
                      <Heart className="w-3.5 h-3.5 fill-rose-500/30 text-rose-400" />
                      <span>{rx.love}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 select-none">
                      <Smile className="w-3.5 h-3.5 fill-amber-500/30 text-amber-400" />
                      <span>{rx.funny}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 select-none">
                      <Frown className="w-3.5 h-3.5 fill-cyan-500/30 text-cyan-400" />
                      <span>{rx.sad}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30 select-none">
                      <Flame className="w-3.5 h-3.5 fill-orange-500/30 text-orange-400" />
                      <span>{rx.fire}</span>
                    </span>
                  </div>

                  {/* Share button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-400" />}
                  >
                    {copied ? 'Link Copied!' : 'Share Today\'s Feature'}
                  </Button>
                </div>
              </article>
            );
          })()
        )}
      </div>
    </div>
  );
}
