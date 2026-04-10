import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import { FaTimes, FaCheckCircle, FaPaperPlane, FaFileAlt, FaLink } from 'react-icons/fa';
import useApplyForm from '../../hooks/useApplyForm';
import AlertBanner from '../ui/AlertBanner';
import Spinner from '../ui/Spinner';

/**
 * ApplyModal
 * Overlay modal for job seekers to apply for a job.
 */
const ApplyModal = ({ isOpen, onClose, jobId, jobTitle = '', onSuccess }) => {
  const { t, i18n } = useTranslation();

  const {
    form,
    setField,
    handleChange,
    handleSubmit,
    resetForm,
    isSubmitting,
    submitError,
    submittedApplication,
  } = useApplyForm({ jobId });

  const userCvs = useSelector(state => state.user.currentUser?.cvs) || [];
  const hasCvs = userCvs.length > 0;

  const succeeded = Boolean(submittedApplication);

  const formatCvDate = useCallback(
    dateString => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString(i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
    [i18n.language]
  );

  useEffect(() => {
    if (!succeeded) return;
    const timer = setTimeout(() => {
      onSuccess?.();
      onClose?.();
      resetForm();
    }, 1400);
    return () => clearTimeout(timer);
  }, [succeeded]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose?.();
  };

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape' && !isSubmitting) handleClose();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isSubmitting]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  /** Keep focused fields visible when the mobile keyboard opens */
  const scrollFocusedFieldIntoView = e => {
    const el = e.target;
    if (!(el instanceof HTMLElement)) return;
    window.requestAnimationFrame(() => {
      setTimeout(() => {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 100);
    });
  };

  if (!isOpen) return null;

  const panelShellClass =
    'pointer-events-auto z-10 box-border flex w-full min-w-0 max-w-[100vw] flex-col overflow-hidden bg-surface ' +
    'max-h-[85vh] supports-[height:100dvh]:max-h-[85dvh] rounded-t-3xl shadow-[0_-12px_48px_rgba(0,0,0,0.15)] ' +
    'sm:max-h-[min(85vh,52rem)] sm:supports-[height:100dvh]:max-h-[min(85dvh,52rem)] sm:max-w-lg md:max-w-xl sm:rounded-2xl sm:shadow-2xl';

  // Success State
  if (succeeded) {
    return (
      <div className="fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-8 sm:px-4 sm:py-10">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden />
        <div className="relative z-10 my-auto w-full min-w-0 max-w-sm max-h-[min(85vh,100%)] supports-[height:100dvh]:max-h-[min(85dvh,100%)] overflow-y-auto overscroll-contain rounded-2xl bg-surface p-4 text-center shadow-2xl sm:max-h-[min(90vh,100%)] sm:p-8">
          <FaCheckCircle className="mx-auto mb-3 text-4xl text-success sm:text-5xl" />
          <p className="text-base font-bold text-text-dark sm:text-lg">
            {t('applications.apply_success_title')}
          </p>
          <p className="mt-2 break-words text-sm leading-relaxed text-subtle">
            <Trans
              i18nKey="applications.apply_success_full"
              values={{ jobTitle: jobTitle || t('applications.apply_modal_job_fallback') }}
              components={{
                bold: <span className="font-medium text-muted break-words" />,
              }}
            />
          </p>
        </div>
      </div>
    );
  }

  // Form — flex wrapper + horizontal padding constrains width (no 100vw / translate centering)
  return (
    <div className="fixed inset-0 z-50 box-border w-full max-w-[100vw] overflow-y-auto overflow-x-hidden overscroll-contain">
      <div
        role="presentation"
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative flex min-h-full w-full max-w-[100vw] min-w-0 items-end justify-center px-0 sm:items-center sm:justify-center sm:px-4 sm:py-6">
        <div
          className={panelShellClass}
          role="dialog"
          aria-modal="true"
          aria-labelledby="apply-modal-title"
        >
          {/* Header */}
          <header className="box-border flex w-full max-w-full shrink-0 items-start justify-between gap-3 border-b border-neutral-100 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] sm:items-center sm:px-6 sm:py-4 sm:pt-4">
            <div className="min-w-0 flex-1 pr-1">
              <p className="text-[0.65rem] font-medium uppercase tracking-wide text-subtle sm:text-xs">
                {t('applications.apply_modal_kicker')}
              </p>
              <h2
                id="apply-modal-title"
                className="mt-0.5 break-words text-base font-bold leading-snug text-text-dark sm:text-lg"
              >
                {jobTitle || t('applications.apply_modal_job_fallback')}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label={t('common.close')}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-subtle transition-colors hover:bg-neutral-200 sm:h-10 sm:w-10"
            >
              <FaTimes className="text-sm" />
            </button>
          </header>

          {/* body */}
          <div
            className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 py-4 pb-5 sm:px-6 sm:py-5 sm:pb-5"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <form id="apply-modal-form" onSubmit={handleSubmit} noValidate>
              <div className="space-y-4 sm:space-y-5">
                <div className="min-w-0 max-w-full">
                  <AlertBanner type="error" message={submitError} />
                </div>

                <div>
                  <label
                    className="mb-1 block text-sm font-semibold text-muted"
                    htmlFor="apply-coverLetter"
                  >
                    {t('applications.apply_cover_letter_label')}{' '}
                    <span className="font-normal text-subtle">
                      {t('applications.apply_optional_paren')}
                    </span>
                  </label>
                  <textarea
                    id="apply-coverLetter"
                    name="coverLetter"
                    rows={4}
                    maxLength={1000}
                    placeholder={t('applications.apply_cover_placeholder')}
                    value={form.coverLetter}
                    onChange={handleChange}
                    onFocus={scrollFocusedFieldIntoView}
                    className="box-border min-h-[5.5rem] w-full max-w-full resize-y rounded-xl border border-border px-3 py-3 text-base leading-normal break-words focus:border-primary focus:outline-none sm:min-h-[7.5rem] sm:text-sm sm:px-4"
                  />
                  <p className="mt-1 text-right text-xs text-subtle">
                    {t('applications.apply_char_count', {
                      current: form.coverLetter.length,
                      max: 1000,
                    })}
                  </p>
                </div>

                <div className="min-w-0">
                  <label
                    className="mb-2 block text-sm font-semibold text-muted"
                    htmlFor="apply-resumeUrl"
                  >
                    {t('applications.apply_resume_label')}{' '}
                    <span className="font-normal text-subtle">
                      {t('applications.apply_optional_paren')}
                    </span>
                  </label>

                  {hasCvs && (
                    <div className="mb-3 space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-subtle">
                        {t('applications.apply_select_uploaded_cvs')}
                      </p>
                      {userCvs.map(cv => (
                        <label
                          key={cv._id}
                          className={`flex min-h-[3.25rem] cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors active:bg-surface-muted/80 sm:items-center ${
                            form.selectedCvId === cv._id
                              ? 'border-success bg-success/5'
                              : 'border-border hover:border-border'
                          }`}
                        >
                          <input
                            type="radio"
                            name="cvSelection"
                            value={cv._id}
                            checked={form.selectedCvId === cv._id}
                            onChange={() => {
                              setField('selectedCvId', cv._id);
                              setField('resumeUrl', '');
                            }}
                            className="mt-0.5 h-4 w-4 shrink-0 accent-success sm:mt-0"
                          />
                          <FaFileAlt className="mt-0.5 h-4 w-4 shrink-0 text-primary sm:mt-0" />
                          <div className="min-w-0 flex-1">
                            <p className="break-words text-sm text-text-dark">{cv.name}</p>
                            <p className="text-xs text-subtle">
                              {t('applications.apply_cv_uploaded', {
                                date: formatCvDate(cv.createdAt),
                              })}
                              {cv.isPrimary && (
                                <span className="ml-2 font-medium text-success">
                                  {t('applications.apply_cv_primary')}
                                </span>
                              )}
                            </p>
                          </div>
                        </label>
                      ))}

                      {form.selectedCvId && (
                        <button
                          type="button"
                          onClick={() => setField('selectedCvId', '')}
                          className="min-h-11 w-full rounded-lg py-2 text-left text-xs text-subtle transition-colors hover:text-muted sm:min-h-0 sm:w-auto sm:py-0"
                        >
                          {t('applications.apply_clear_selection')}
                        </button>
                      )}
                    </div>
                  )}

                  {hasCvs && (
                    <div className="my-3 flex min-w-0 items-center gap-2 sm:gap-3">
                      <div className="h-px min-w-0 flex-1 bg-neutral-200" />
                      <span className="min-w-0 shrink px-1 text-center text-xs leading-tight text-subtle break-words">
                        {t('applications.apply_or_paste_link')}
                      </span>
                      <div className="h-px min-w-0 flex-1 bg-neutral-200" />
                    </div>
                  )}

                  <div className="relative min-w-0 max-w-full">
                    <FaLink className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
                    <input
                      id="apply-resumeUrl"
                      name="resumeUrl"
                      type="url"
                      inputMode="url"
                      autoComplete="url"
                      placeholder={t('applications.apply_resume_url_placeholder')}
                      value={form.resumeUrl}
                      onChange={e => {
                        handleChange(e);
                        if (e.target.value) setField('selectedCvId', '');
                      }}
                      onFocus={scrollFocusedFieldIntoView}
                      className="box-border min-h-12 w-full min-w-0 max-w-full overflow-hidden text-ellipsis rounded-xl border border-border py-3 pl-9 pr-3 text-base focus:border-primary focus:outline-none sm:min-h-10 sm:text-sm sm:pr-4"
                    />
                  </div>
                  <p className="mt-1 text-xs leading-snug text-subtle">
                    {hasCvs
                      ? t('applications.apply_resume_hint_with_cvs')
                      : t('applications.apply_resume_hint_no_cvs')}
                  </p>
                </div>
              </div>
            </form>
          </div>

          <footer className="box-border flex w-full max-w-full min-w-0 shrink-0 flex-col-reverse gap-3 border-t border-neutral-100 bg-surface px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4 sm:pb-4">
            <button
              type="button"
              onClick={handleClose}
              className="min-h-12 w-full touch-manipulation rounded-xl py-3 text-center text-sm text-subtle transition-colors hover:text-primary sm:min-h-0 sm:w-auto sm:py-0 sm:text-left"
            >
              {t('common.cancel')}
            </button>
            <button
              form="apply-modal-form"
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 whitespace-normal rounded-xl bg-success px-4 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10 sm:w-auto sm:whitespace-nowrap sm:px-6 sm:py-2.5"
            >
              {isSubmitting ? <Spinner size="sm" /> : <FaPaperPlane className="text-xs" />}
              {isSubmitting ? t('applications.apply_submitting') : t('applications.apply_submit')}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;
