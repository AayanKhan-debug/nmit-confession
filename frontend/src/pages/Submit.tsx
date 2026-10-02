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
  Button
} from '../components/ui';
import { SUBMISSION_CATEGORY_KEYS } from '../utils/categoryTheme';

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
      ? 'text-slate-500'
      : content.length > 1900
      ? 'text-rose-400'
      : content.length > 1700
      ? 'text-amber-400'
      : 'text-violet-400';

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Privacy Guarantee Banner */}
      <section className="p-5 sm:p-6 rounded-[24px] bg-[#111827]/85 backdrop-blur-md border border-violet-500/30 shadow-xl flex items-start gap-4 relative overflow-hidden">
        <div className="p-3 rounded-2xl bg-violet-500/15 text-violet-400 shrink-0 mt-0.5 border border-violet-500/30">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-white font-heading">
              100% Anonymous Submission
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold border border-violet-500/30">
              Zero Logs
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Your name, student ID, IP address, and browser identity are never stored or tracked. Submissions are screened automatically and approved by campus moderators before going live.
          </p>
        </div>
      </section>

      {/* Main Submission Form Card or Success Card */}
      <div className="relative rounded-[24px] bg-[#111827]/85 backdrop-blur-md border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Success View */}
        {isSuccess ? (
          <div className="text-center py-6 sm:py-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-2" aria-hidden="true">
              <div className="w-18 h-18 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-500/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            </div>

            <div className="space-y-2 max-w-sm mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-heading">
                Confession Queued!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Your story was encrypted and sent to the student moderation queue. As soon as it passes review, it will drop onto the live campus feed.
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
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
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
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-heading">
                  Post a Confession
                </h1>
                <Sparkles className="w-5 h-5 text-pink-400" />
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Say it. Stay anonymous. Express yourself respectfully.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-start gap-3 text-xs animate-in fade-in duration-150"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="flex-1 leading-relaxed">
                  <strong className="font-bold">Submission error: </strong>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Picker Chips */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Select Category <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {SUBMISSION_CATEGORY_KEYS.map((catKey) => (
                    <CategoryChip
                      key={catKey}
                      categoryKey={catKey}
                      selected={category === catKey}
                      onSelectCategory={(k) => setCategory(k)}
                    />
                  ))}
                </div>
              </div>

              {/* Title Field (Optional) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="confession-title" className="font-bold uppercase tracking-wider text-slate-300">
                    Headline <span className="text-slate-500 font-normal normal-case">(optional)</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {maxTitleLength - title.length} left
                  </span>
                </div>
                <Input
                  id="confession-title"
                  type="text"
                  maxLength={maxTitleLength}
                  placeholder="Give your confession a catchy headline..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm"
                />
              </div>

              {/* Message Content Area */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="confession-content" className="font-bold uppercase tracking-wider text-slate-300">
                    Your Confession <span className="text-rose-400">*</span>
                  </label>

                  {/* Live Character Progress Ring */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-mono font-semibold ${
                        content.length < minContentLength
                          ? 'text-slate-500'
                          : content.length > 1900
                          ? 'text-rose-400'
                          : 'text-slate-300'
                      }`}
                      aria-live="polite"
                    >
                      {content.length}/{maxContentLength}
                    </span>

                    {/* Circular SVG Ring */}
                    <svg className="w-5 h-5 -rotate-90 transform" viewBox="0 0 36 36" aria-hidden="true">
                      <path
                        className="text-white/10"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
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
                  className="w-full resize-y min-h-[150px]"
                />

                {content.length > 0 && content.length < minContentLength && (
                  <p className="text-[11px] text-amber-400 flex items-center gap-1 pt-1 font-semibold">
                    <Info className="w-3.5 h-3.5" />
                    <span>Need at least {minContentLength - content.length} more character{minContentLength - content.length === 1 ? '' : 's'}.</span>
                  </p>
                )}
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting || content.trim().length < minContentLength}
                isLoading={isSubmitting}
                rightIcon={<Send className="w-4 h-4" />}
                className="w-full justify-center min-h-[48px] text-base"
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
