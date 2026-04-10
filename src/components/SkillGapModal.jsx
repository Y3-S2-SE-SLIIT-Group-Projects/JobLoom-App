import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  FaTimes,
  FaFileAlt,
  FaChartBar,
  FaExclamationTriangle,
  FaLightbulb,
  FaCheckCircle,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { aiApi } from '../services/aiApi';

const SkillGapModal = ({ isOpen, onClose, jobId, jobTitle = '' }) => {
  const { t, i18n } = useTranslation();
  const cvSelector = useSelector(state => state.user.currentUser?.cvs);

  const userCvs = useMemo(() => {
    const seen = new Set();
    return (cvSelector || []).filter(cv => {
      if (!cv._id || seen.has(cv._id)) return false;
      seen.add(cv._id);
      return true;
    });
  }, [cvSelector]);

  const [selectedCvId, setSelectedCvId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedCvId('');
    setError('');
    setResult(null);
    setLoading(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape' && !loading) onClose?.();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, loading, onClose]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedCvId || !jobId) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await aiApi.analyzeSkillGap({
        jobId,
        cvId: selectedCvId,
        language: i18n.language,
      });
      setResult(res.data?.data || res.data);
    } catch (err) {
      setError(err.message || t('skill_gap.error_failed'));
    } finally {
      setLoading(false);
    }
  }, [selectedCvId, jobId, i18n.language, t]);

  if (!isOpen) return null;

  const scoreColor =
    result?.matchScore >= 70
      ? 'text-success'
      : result?.matchScore >= 40
        ? 'text-warning'
        : 'text-error';

  const scoreBg =
    result?.matchScore >= 70
      ? 'bg-success/10 border-success/30'
      : result?.matchScore >= 40
        ? 'bg-warning/10 border-warning/30'
        : 'bg-error/10 border-error/30';

  return (
    <div className="fixed inset-0 z-50 box-border w-full max-w-[100vw] overflow-y-auto overflow-x-hidden overscroll-contain">
      <div
        role="presentation"
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !loading && onClose?.()}
      />

      <div className="relative flex min-h-full w-full max-w-[100vw] min-w-0 items-end justify-center px-0 sm:items-center sm:justify-center sm:px-4 sm:py-6">
        <div
          className="pointer-events-auto z-10 box-border flex w-full min-w-0 max-w-[100vw] flex-col overflow-hidden bg-surface max-h-[85vh] supports-[height:100dvh]:max-h-[85dvh] rounded-t-3xl shadow-[0_-12px_48px_rgba(0,0,0,0.15)] sm:max-h-[min(85vh,52rem)] sm:supports-[height:100dvh]:max-h-[min(85dvh,52rem)] sm:max-w-lg md:max-w-xl sm:rounded-2xl sm:shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="skill-gap-modal-title"
        >
          {/* Header */}
          <header className="box-border flex w-full max-w-full shrink-0 items-start justify-between gap-3 border-b border-neutral-100 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] sm:items-center sm:px-6 sm:py-4 sm:pt-4">
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-[0.65rem] font-medium uppercase tracking-wide text-subtle sm:text-xs">
                {t('skill_gap.kicker')}
              </p>
              <h2
                id="skill-gap-modal-title"
                className="mt-0.5 break-words text-base font-bold leading-snug text-text-dark sm:text-lg"
              >
                {jobTitle || t('skill_gap.title_fallback')}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => !loading && onClose?.()}
              aria-label="Close"
              className="flex items-center justify-center transition-colors rounded-full h-11 w-11 shrink-0 bg-neutral-100 text-subtle hover:bg-neutral-200 sm:h-10 sm:w-10"
            >
              <FaTimes className="text-sm" />
            </button>
          </header>

          {/* Body */}
          <div
            className="flex-1 min-h-0 px-4 py-4 pb-5 overflow-x-hidden overflow-y-auto overscroll-y-contain sm:px-6 sm:py-5 sm:pb-5"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {!result && (
              <>
                {/* CV Selection */}
                {userCvs.length === 0 ? (
                  <div className="p-4 text-center border rounded-xl border-warning/30 bg-warning/5">
                    <FaExclamationTriangle className="mx-auto mb-2 text-2xl text-warning" />
                    <p className="text-sm font-medium text-text-dark">
                      {t('skill_gap.no_cvs_title')}
                    </p>
                    <p className="mt-1 text-xs text-muted">{t('skill_gap.no_cvs_desc')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-medium tracking-wide uppercase text-subtle">
                      {t('skill_gap.select_cv')}
                    </p>
                    {userCvs.map(cv => (
                      <label
                        key={cv._id}
                        className={`flex min-h-[3.25rem] cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors sm:items-center ${
                          selectedCvId === cv._id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/40'
                        } ${loading ? 'pointer-events-none opacity-60' : ''}`}
                      >
                        <input
                          type="radio"
                          name="skillGapCv"
                          value={cv._id}
                          checked={selectedCvId === cv._id}
                          onChange={() => setSelectedCvId(cv._id)}
                          disabled={loading}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-primary sm:mt-0"
                        />
                        <FaFileAlt className="mt-0.5 h-4 w-4 shrink-0 text-primary sm:mt-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm break-words text-text-dark">{cv.name}</p>
                          {cv.isPrimary && (
                            <span className="text-xs font-medium text-success">
                              {t('common.primary')}
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="p-3 mt-4 border rounded-xl border-error/30 bg-error/5">
                    <p className="text-sm text-error">{error}</p>
                  </div>
                )}
              </>
            )}

            {/* Results */}
            {result && !loading && (
              <div className="space-y-5">
                {/* Match Score */}
                <div className={`rounded-xl border p-5 text-center ${scoreBg}`}>
                  <FaChartBar className={`mx-auto mb-2 text-3xl ${scoreColor}`} />
                  <p className="text-xs font-medium tracking-wide uppercase text-subtle">
                    {t('skill_gap.match_score')}
                  </p>
                  <p className={`mt-1 text-4xl font-bold ${scoreColor}`}>{result.matchScore}%</p>
                </div>

                {/* Summary */}
                {result.summary && (
                  <div className="p-4 border rounded-xl border-border bg-neutral-50">
                    <p className="text-sm leading-relaxed text-muted">{result.summary}</p>
                  </div>
                )}

                {/* Missing Skills */}
                {result.missingSkills?.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 mb-2 text-sm font-semibold text-text-dark">
                      <FaExclamationTriangle className="text-warning" />
                      {t('skill_gap.missing_skills')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 text-xs font-medium border rounded-full border-warning/30 bg-warning/10 text-warning"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Skills */}
                {result.recommendedSkills?.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 mb-2 text-sm font-semibold text-text-dark">
                      <FaLightbulb className="text-info" />
                      {t('skill_gap.recommended_skills')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.recommendedSkills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 text-xs font-medium border rounded-full border-info/30 bg-info/10 text-info"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.missingSkills?.length === 0 && result.recommendedSkills?.length === 0 && (
                  <div className="flex items-center gap-2 p-4 border rounded-xl border-success/30 bg-success/5">
                    <FaCheckCircle className="text-lg shrink-0 text-success" />
                    <p className="text-sm text-muted">{t('skill_gap.great_match')}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="box-border flex w-full max-w-full min-w-0 shrink-0 flex-col-reverse gap-3 border-t border-neutral-100 bg-surface px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4 sm:pb-4">
            <button
              type="button"
              onClick={() => !loading && onClose?.()}
              className="w-full py-3 text-sm text-center transition-colors min-h-12 touch-manipulation rounded-xl text-subtle hover:text-primary sm:min-h-0 sm:w-auto sm:py-0 sm:text-left"
            >
              {result ? t('common.close') : t('common.cancel')}
            </button>

            {!result && (
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading || !selectedCvId || userCvs.length === 0}
                className="flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 whitespace-normal rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10 sm:w-auto sm:whitespace-nowrap sm:px-6 sm:py-2.5"
              >
                <FaChartBar className="text-xs" />
                {loading ? t('skill_gap.analyzing') : t('skill_gap.analyze')}
              </button>
            )}

            {result && (
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setSelectedCvId('');
                  setError('');
                }}
                className="flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 whitespace-normal rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:min-h-10 sm:w-auto sm:whitespace-nowrap sm:px-6 sm:py-2.5"
              >
                <FaChartBar className="text-xs" />
                {t('skill_gap.analyze_another')}
              </button>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
};

export default SkillGapModal;
