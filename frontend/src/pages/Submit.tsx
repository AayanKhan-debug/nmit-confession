import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import {
  ShieldCheck,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Info
} from 'lucide-react';
import {
  CategoryChip,
  Input,
  Textarea,
  Button,
  Badge
} from '../components/ui';

const CATEGORIES = [
  { key: 'CAMPUS_LIFE', label: 'Campus Life', emoji: '🏫' },
  { key: 'ADVICE', label: 'Advice', emoji: '💡' },
  { key: 'RANT', label: 'Rant', emoji: '🗣️' },
  { key: 'FUNNY', label: 'Funny', emoji: '😂' },
  { key: 'CRUSH', label: 'Crushes', emoji: '💖' },
  { key: 'OTHER', label: 'Other', emoji: '🔮' },
];

export default function Submit() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('CAMPUS_LIFE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const maxContentLength = 2000;
  const minContentLength = 10;
  const maxTitleLength = 120;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < minContentLength) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await api.post('/confessions', {
        title: title.trim() || undefined,
        content: content.trim(),
        category
      });
      setIsSuccess(true);
      setTitle('');
      setContent('');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to submit confession. Please check the requirements and try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setErrorMessage('');
    setTitle('');
    setContent('');
    setCategory('CAMPUS_LIFE');
  };

  // Circular progress ring calculation
  const charPercentage = Math.min(100, (content.length / maxContentLength) * 100);
  const strokeDashoffset = 100 - charPercentage;
  const ringColor =
    content.length < minContentLength
      ? 'text-[var(--text-muted)]'
      : content.length > 1900
      ? 'text-rose-500'
      : content.length > 1700
      ? 'text-amber-500'
      : 'text-violet-500';

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Privacy Notice Banner */}
      <section className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-violet-500/20 shadow-xs flex items-start gap-3.5 relative overflow-hidden">
        <div className="p-2.5 rounded-2xl bg-violet-500/10 text-violet-500 shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Guaranteed Anonymous Submission
            </h2>
            <Badge variant="violet" size="sm">
              Zero Logs
            </Badge>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Your name, student ID, and IP address are never stored or logged. Submissions are screened automatically and reviewed by student moderators before going live.
          </p>
        </div>
      </section>

      {/* Main Form or Success Card */}
      <div className="relative rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 shadow-xs overflow-hidden">
        {/* Success View */}
        {isSuccess ? (
          <div className="text-center py-6 sm:py-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Lightweight CSS Confetti Burst */}
            <div className="flex justify-center mb-2" aria-hidden="true">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-2 max-w-sm mx-auto">
              <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Confession Queued!
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Your story was encrypted and sent to the moderation queue. As soon as it passes community review, it will appear on the public feed.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={handleReset}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Drop Another Story
              </Button>

              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors min-h-[44px]"
              >
                <span>Return to Feed</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Form View */
          <div>
            <div className="mb-6 space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                  Post a Confession
                </h1>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Express yourself respectfully. Minimum 10 characters required.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-start gap-3 text-xs animate-in fade-in duration-150"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <strong className="font-bold">Submission error: </strong>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Picker Chips */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Category <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {CATEGORIES.map((cat) => (
                    <CategoryChip
                      key={cat.key}
                      categoryKey={cat.key}
                      selected={category === cat.key}
                      onSelectCategory={(k) => setCategory(k)}
                    />
                  ))}
                </div>
              </div>

              {/* Title Field (Optional) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="confession-title" className="font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Headline <span className="text-[var(--text-muted)] font-normal normal-case">(optional)</span>
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {maxTitleLength - title.length} left
                  </span>
                </div>
                <Input
                  id="confession-title"
                  type="text"
                  maxLength={maxTitleLength}
                  placeholder="Give your story a punchy title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Message Content Area */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="confession-content" className="font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Confession Story <span className="text-rose-500">*</span>
                  </label>

                  {/* Live Character Progress Ring */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-semibold ${
                        content.length < minContentLength
                          ? 'text-[var(--text-muted)]'
                          : content.length > 1900
                          ? 'text-rose-500'
                          : 'text-[var(--text-secondary)]'
                      }`}
                      aria-live="polite"
                    >
                      {content.length}/{maxContentLength}
                    </span>

                    {/* Circular SVG Ring */}
                    <svg className="w-5 h-5 -rotate-90 transform" viewBox="0 0 36 36" aria-hidden="true">
                      {/* Background circle */}
                      <path
                        className="text-[var(--border-subtle)]"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {/* Progress circle */}
                      <path
                        className={`${ringColor} transition-all duration-150`}
                        strokeDasharray="100, 100"
                        strokeDashoffset={strokeDashoffset}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                  </div>
                </div>

                <Textarea
                  id="confession-content"
                  required
                  rows={6}
                  maxLength={maxContentLength}
                  placeholder="Drop what's happening around campus... (at least 10 characters)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full resize-y min-h-[140px]"
                />

                {content.length > 0 && content.length < minContentLength && (
                  <p className="text-[11px] text-amber-500 flex items-center gap-1 pt-1 font-medium">
                    <Info className="w-3.5 h-3.5" />
                    <span>Need at least {minContentLength - content.length} more character{minContentLength - content.length === 1 ? '' : 's'}.</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting || content.trim().length < minContentLength}
                isLoading={isSubmitting}
                rightIcon={<Send className="w-4 h-4" />}
                className="w-full justify-center"
              >
                Submit Confession Anonymously
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
