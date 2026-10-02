import React, { useState } from 'react';
import type { Confession } from '../types';
import { getCategoryTheme } from '../utils/categoryTheme';
import {
  Clock,
  Shield,
  Heart,
  Smile,
  Frown,
  Flame,
  AlertTriangle,
  Share2,
  Check
} from 'lucide-react';

export interface ConfessionCardProps {
  confession: Confession;
  onReaction?: (id: number, type: 'LOVE' | 'FUNNY' | 'SAD' | 'FIRE') => void;
  onReport?: (id: number) => void;
  isReacting?: boolean;
  activeReactionKey?: string | null;
  userReaction?: 'LOVE' | 'FUNNY' | 'SAD' | 'FIRE' | null;
  hasReacted?: boolean;
  className?: string;
  showRanking?: number;
}

export const ConfessionCard: React.FC<ConfessionCardProps> = ({
  confession,
  onReaction,
  onReport,
  isReacting = false,
  activeReactionKey = null,
  userReaction = null,
  hasReacted = false,
  className = '',
  showRanking
}) => {
  const [copied, setCopied] = useState(false);
  const theme = getCategoryTheme(confession.category);

  const getReactionCount = (type: 'LOVE' | 'FUNNY' | 'SAD' | 'FIRE') => {
    const r = confession.reactions || {};
    return r[type] ?? (confession as any)[`reaction${type.charAt(0) + type.slice(1).toLowerCase()}Count`] ?? 0;
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/?highlight=${confession.id}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  // Ranking badge style for Trending podium
  const renderRankingBadge = () => {
    if (!showRanking) return null;
    let badgeClass = 'bg-slate-800 text-slate-300 border-white/10';
    let label = `#${showRanking}`;

    if (showRanking === 1) {
      badgeClass = 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-sm shadow-amber-400/20';
      label = '👑 #1';
    } else if (showRanking === 2) {
      badgeClass = 'bg-slate-300/20 text-slate-200 border-slate-300/40 shadow-sm shadow-slate-300/20';
      label = '🥈 #2';
    } else if (showRanking === 3) {
      badgeClass = 'bg-amber-700/20 text-amber-400 border-amber-600/40 shadow-sm shadow-amber-700/20';
      label = '🥉 #3';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black border tracking-wide uppercase mr-2 ${badgeClass}`}>
        {label}
      </span>
    );
  };

  return (
    <article
      className={`rounded-[24px] bg-[#111827]/85 backdrop-blur-md border border-white/10 p-6 sm:p-7 shadow-xl shadow-black/40 hover:-translate-y-0.5 hover:border-violet-500/30 hover:shadow-violet-500/10 transition-all duration-200 relative overflow-hidden flex flex-col justify-between group ${theme.leftBorderClass} ${className}`}
    >
      {/* Top Metadata Row: Ranking + Category Sticker + Anonymous Tag + Timestamp */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4">
        <div className="flex items-center gap-2">
          {renderRankingBadge()}

          {/* Category Sticker Chip */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border tracking-wide select-none ${theme.badgeClass}`}
          >
            <span role="img" aria-hidden="true">{theme.emoji}</span>
            <span>{theme.label}</span>
          </span>

          {/* Anonymous Tag */}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-slate-400 border border-white/5 select-none">
            <Shield className="w-3 h-3 text-violet-400 shrink-0" />
            <span>Anonymous</span>
          </span>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 select-none">
          <Clock className="w-3.5 h-3.5 shrink-0 text-slate-500" />
          <time dateTime={confession.createdAt}>
            {new Date(confession.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
        </div>
      </div>

      {/* Confession Title (if present) */}
      {confession.title && (
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-2 leading-snug font-heading">
          {confession.title}
        </h2>
      )}

      {/* Confession Body (Plain text, preserved whitespace, relaxed line-height) */}
      <p className="text-slate-200 whitespace-pre-wrap text-sm sm:text-base leading-relaxed mb-6 font-normal break-words">
        {confession.content}
      </p>

      {/* Bottom Actions Row: Emoji Reaction Pills + Share + Report */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 mt-auto">
        {/* Reaction Emoji Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2" role="group" aria-label="Confession reactions">
          {(() => {
            const isAlreadyReacted = hasReacted || !!userReaction;
            const isDisabled = isReacting || isAlreadyReacted;
            const isLoveActive = activeReactionKey === `${confession.id}-LOVE` || userReaction === 'LOVE';
            const isFunnyActive = activeReactionKey === `${confession.id}-FUNNY` || userReaction === 'FUNNY';
            const isSadActive = activeReactionKey === `${confession.id}-SAD` || userReaction === 'SAD';
            const isFireActive = activeReactionKey === `${confession.id}-FIRE` || userReaction === 'FIRE';

            return (
              <>
                {/* LOVE */}
                <button
                  type="button"
                  onClick={() => onReaction?.(confession.id, 'LOVE')}
                  disabled={isDisabled}
                  aria-pressed={isLoveActive}
                  aria-label={`React with Love (${getReactionCount('LOVE')})`}
                  title={isAlreadyReacted ? "You've already reacted to this confession" : undefined}
                  className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19] select-none ${
                    isLoveActive
                      ? 'bg-rose-500/25 border-rose-400/60 text-rose-300 font-bold scale-105 shadow-sm shadow-rose-500/20 cursor-default'
                      : isDisabled
                      ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/5 text-slate-400'
                      : 'bg-white/5 hover:bg-rose-500/15 border-white/10 hover:border-rose-400/40 text-slate-300 hover:text-rose-300 cursor-pointer active:scale-95'
                  }`}
                >
                  <Heart className={`w-4 h-4 shrink-0 transition-transform ${isLoveActive ? 'text-rose-400 fill-rose-500/40' : 'text-rose-400 fill-rose-500/20'}`} />
                  <span className="font-mono text-xs">{getReactionCount('LOVE')}</span>
                </button>

                {/* FUNNY */}
                <button
                  type="button"
                  onClick={() => onReaction?.(confession.id, 'FUNNY')}
                  disabled={isDisabled}
                  aria-pressed={isFunnyActive}
                  aria-label={`React with Haha (${getReactionCount('FUNNY')})`}
                  title={isAlreadyReacted ? "You've already reacted to this confession" : undefined}
                  className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19] select-none ${
                    isFunnyActive
                      ? 'bg-amber-500/25 border-amber-400/60 text-amber-300 font-bold scale-105 shadow-sm shadow-amber-500/20 cursor-default'
                      : isDisabled
                      ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/5 text-slate-400'
                      : 'bg-white/5 hover:bg-amber-500/15 border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-amber-300 cursor-pointer active:scale-95'
                  }`}
                >
                  <Smile className={`w-4 h-4 shrink-0 transition-transform ${isFunnyActive ? 'text-amber-400 fill-amber-500/40' : 'text-amber-400 fill-amber-500/20'}`} />
                  <span className="font-mono text-xs">{getReactionCount('FUNNY')}</span>
                </button>

                {/* SAD */}
                <button
                  type="button"
                  onClick={() => onReaction?.(confession.id, 'SAD')}
                  disabled={isDisabled}
                  aria-pressed={isSadActive}
                  aria-label={`React with Sad (${getReactionCount('SAD')})`}
                  title={isAlreadyReacted ? "You've already reacted to this confession" : undefined}
                  className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19] select-none ${
                    isSadActive
                      ? 'bg-cyan-500/25 border-cyan-400/60 text-cyan-300 font-bold scale-105 shadow-sm shadow-cyan-500/20 cursor-default'
                      : isDisabled
                      ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/5 text-slate-400'
                      : 'bg-white/5 hover:bg-cyan-500/15 border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300 cursor-pointer active:scale-95'
                  }`}
                >
                  <Frown className={`w-4 h-4 shrink-0 transition-transform ${isSadActive ? 'text-cyan-400 fill-cyan-500/40' : 'text-cyan-400 fill-cyan-500/20'}`} />
                  <span className="font-mono text-xs">{getReactionCount('SAD')}</span>
                </button>

                {/* FIRE */}
                <button
                  type="button"
                  onClick={() => onReaction?.(confession.id, 'FIRE')}
                  disabled={isDisabled}
                  aria-pressed={isFireActive}
                  aria-label={`React with Fire (${getReactionCount('FIRE')})`}
                  title={isAlreadyReacted ? "You've already reacted to this confession" : undefined}
                  className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19] select-none ${
                    isFireActive
                      ? 'bg-orange-500/25 border-orange-400/60 text-orange-300 font-bold scale-105 shadow-sm shadow-orange-500/20 cursor-default'
                      : isDisabled
                      ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/5 text-slate-400'
                      : 'bg-white/5 hover:bg-orange-500/15 border-white/10 hover:border-orange-400/40 text-slate-300 hover:text-orange-300 cursor-pointer active:scale-95'
                  }`}
                >
                  <Flame className={`w-4 h-4 shrink-0 transition-transform ${isFireActive ? 'text-orange-400 fill-orange-500/40' : 'text-orange-400 fill-orange-500/20'}`} />
                  <span className="font-mono text-xs">{getReactionCount('FIRE')}</span>
                </button>

                {/* Reacted Feedback Badge */}
                {isAlreadyReacted && (
                  <span
                    className="text-[11px] font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 select-none shadow-sm ml-1"
                    title="You've already reacted to this confession"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Reacted</span>
                  </span>
                )}
              </>
            );
          })()}
        </div>

        {/* Right Actions: Share/Copy + Report */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Share/Copy link */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share confession link"
            title={copied ? 'Link copied!' : 'Copy link to confession'}
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-full text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-150 flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 cursor-pointer select-none"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Share</span>
              </>
            )}
          </button>

          {/* Report Button */}
          {onReport && (
            <button
              type="button"
              onClick={() => onReport(confession.id)}
              aria-label="Report this confession"
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-full text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-150 flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer select-none"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Report</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default ConfessionCard;
