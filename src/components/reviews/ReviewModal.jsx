import { useEffect } from 'react';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';
import useReviewForm from '../../hooks/useReviewForm';
import Spinner from '../ui/Spinner';
import ReviewForm from './ReviewForm';

/**
 * ReviewModal
 * Slide-in overlay modal for writing OR editing a review.
 * Delegates the form body to ReviewForm — no duplicated field logic here.
 *
 * Props:
 *   isOpen        {boolean}  – show/hide
 *   onClose       {Function} – called after success or on cancel
 *   jobId         {string}   – pre-filled
 *   revieweeId    {string}   – pre-filled
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
  revieweeName = '',
  jobTitle = '',
  existingReview = null,
  onSuccess,
}) => {
  const {
    form,
    setField,
    handleChange,
    handleImageChange,
    removeImage,
    images,
    imagePreviews,
    handleSubmit,
    resetForm,
    isSubmitting,
    submitError,
    submittedReview,
    editSuccess,
    isEdit,
  } = useReviewForm({ jobId, revieweeId }, existingReview);

  const succeeded = isEdit ? editSuccess : Boolean(submittedReview);

  useEffect(() => {
    if (!succeeded) return;
    const t = setTimeout(() => {
      onSuccess?.();
      onClose?.();
      resetForm();
    }, 1400);
    return () => clearTimeout(t);
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

  if (!isOpen) return null;

  const canSubmit = form.rating > 0 && !isSubmitting;

  // \u2500\u2500 Success State \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
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

  // \u2500\u2500 Form \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Panel */}
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
          <ReviewForm
            form={form}
            setField={setField}
            handleChange={handleChange}
            handleImageChange={handleImageChange}
            removeImage={removeImage}
            images={images}
            imagePreviews={imagePreviews}
            submitError={submitError}
            formId="review-modal-form"
            onSubmit={handleSubmit}
            commentFieldId="modal-comment"
          />
        </div>

        {/* Footer — outside the scrollable area; button targets form by id */}
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
                ? 'Saving\u2026'
                : 'Submitting\u2026'
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
