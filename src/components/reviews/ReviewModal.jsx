import { useEffect } from 'react';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';
import useReviewForm from '../../hooks/useReviewForm';
import StarRating from '../ui/StarRating';
import AlertBanner from '../ui/AlertBanner';
import Spinner from '../ui/Spinner';
import CriteriaInput from './CriteriaInput';
import ReviewerTypeToggle from './ReviewerTypeToggle';

/**
 * ReviewModal
 * Slide-in overlay modal for writing OR editing a review.
 * No page navigation required — drop it anywhere and control via isOpen/onClose.
 *
 * Props:
 *   isOpen        {boolean}  – show/hide
 *   onClose       {Function} – called after success or on cancel
 *   jobId         {string}   – pre-filled, not shown to user
 *   revieweeId    {string}   – pre-filled, not shown to user
 *   reviewerType  {string}   – 'job_seeker' | 'employer'
 *   revieweeName  {string}   – displayed in the header
 *   jobTitle      {string}   – displayed in the header
 *   existingReview {Object}  – when provided, switches to EDIT mode
 *   onSuccess     {Function} – optional callback after successful submit/edit
 */
const ReviewModal = ({
  isOpen,
  onClose,
  jobId = '',
  revieweeId = '',
  reviewerType = 'job_seeker',
  revieweeName = '',
  jobTitle = '',
  existingReview = null,
  onSuccess,
}) => {
  const defaults = { jobId, revieweeId, reviewerType };

  const {
    form,
    setField,
    handleChange,
    handleSubmit,
    resetForm,
    isSubmitting,
    submitError,
    submittedReview,
    editSuccess,
    isEdit,
  } = useReviewForm(defaults, existingReview);

  const succeeded = isEdit ? editSuccess : Boolean(submittedReview);

  // After success: brief delay, then close & notify parent
  useEffect(() => {
    if (!succeeded) return;
    const t = setTimeout(() => {
      onSuccess?.();
      onClose?.();
      resetForm();
    }, 1400);
    return () => clearTimeout(t);
  }, [succeeded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Declared before the effect that references it to satisfy the
  // react-hooks/immutability rule (no access-before-declare).
  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose?.();
  };

  // Close on Escape
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape' && !isSubmitting) handleClose();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isSubmitting]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const isEmployer = form.reviewerType === 'employer';
  const canSubmit = form.rating > 0 && !isSubmitting;

  // ── Success State ───────────────────────────────────────────────────────
  if (succeeded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-sm p-8 text-center bg-surface shadow-2xl rounded-2xl">
          <FaCheckCircle className="mx-auto mb-3 text-5xl text-success" />
          <p className="text-lg font-bold text-text-dark">
            {isEdit ? 'Review updated!' : 'Review submitted!'}
          </p>
          <p className="mt-1 text-sm text-subtle">
            {isEdit
              ? 'Your changes have been saved.'
              : `Thanks for reviewing ${revieweeName || 'this user'}.`}
          </p>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Panel — slides up from bottom on mobile, centered on desktop */}
      <div className="relative bg-surface w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
          <div>
            <p className="text-xs font-medium tracking-wide text-subtle uppercase">
              {isEdit ? 'Edit Review' : 'Write a Review'}
            </p>
            <h2 className="text-base font-bold text-text-dark leading-tight">
              {revieweeName || 'Review User'}
            </h2>
            {jobTitle && (
              <p className="text-xs text-subtle mt-0.5">
                Job: <span className="text-muted">{jobTitle}</span>
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 text-subtle transition-colors bg-neutral-100 rounded-full hover:bg-neutral-200"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 px-6 py-5 overflow-y-auto">
          <form id="review-modal-form" onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              <AlertBanner type="error" message={submitError} />

              {/* Reviewer type toggle — only show on create */}
              {!isEdit && (
                <ReviewerTypeToggle
                  value={form.reviewerType}
                  onChange={v => setField('reviewerType', v)}
                />
              )}

              {/* Overall Rating */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-muted">
                  Overall Rating <span className="text-error">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <StarRating
                    value={form.rating}
                    interactive
                    onChange={v => setField('rating', v)}
                    size="text-3xl"
                  />
                  {form.rating > 0 && (
                    <span className="text-xl font-bold text-secondary">{form.rating}.0</span>
                  )}
                </div>
              </div>

              {/* Detailed Criteria */}
              <div>
                <p className="mb-1 text-sm font-semibold text-muted">
                  Detailed Ratings <span className="font-normal text-subtle">(optional)</span>
                </p>
                <div className="px-4 py-2 border border-border rounded-xl">
                  <CriteriaInput
                    label="Work Quality"
                    field="workQuality"
                    value={form.workQuality}
                    onChange={setField}
                  />
                  <CriteriaInput
                    label="Communication"
                    field="communication"
                    value={form.communication}
                    onChange={setField}
                  />
                  {isEmployer ? (
                    <CriteriaInput
                      label="Payment on Time"
                      field="paymentOnTime"
                      value={form.paymentOnTime}
                      onChange={setField}
                    />
                  ) : (
                    <CriteriaInput
                      label="Punctuality"
                      field="punctuality"
                      value={form.punctuality}
                      onChange={setField}
                    />
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label
                  className="block mb-1 text-sm font-semibold text-muted"
                  htmlFor="modal-comment"
                >
                  Comment
                </label>
                <textarea
                  id="modal-comment"
                  name="comment"
                  rows={4}
                  maxLength={1000}
                  placeholder="Share details about your experience…"
                  value={form.comment}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm resize-none focus:outline-none focus:border-primary"
                />
                <p className="mt-1 text-xs text-right text-subtle">{form.comment.length}/1000</p>
              </div>

              {/* Would Recommend */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="wouldRecommend"
                  checked={form.wouldRecommend}
                  onChange={handleChange}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm text-muted">I would recommend this person</span>
              </label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-neutral-100 shrink-0">
          <button
            onClick={handleClose}
            className="text-sm text-subtle hover:text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            form="review-modal-form"
            type="submit"
            disabled={!canSubmit}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Spinner size="sm" />}
            {isSubmitting
              ? isEdit
                ? 'Saving…'
                : 'Submitting…'
              : isEdit
                ? 'Save Changes'
                : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
