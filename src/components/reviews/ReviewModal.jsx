import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle2, Briefcase } from 'lucide-react';
import useReviewForm from '../../hooks/useReviewForm';
import ReviewForm from './ReviewForm';

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
  const { t } = useTranslation();

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
    effectiveRating,
  } = useReviewForm({ jobId, revieweeId }, existingReview);

  const succeeded = isEdit ? editSuccess : Boolean(submittedReview);

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

  if (!isOpen) return null;

  const canSubmit = effectiveRating > 0 && form.revieweeId && form.jobId && !isSubmitting;

  if (succeeded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-2xl p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-text">
            {isEdit ? t('reviews.review_updated') : t('reviews.review_submitted')}
          </p>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            {isEdit
              ? t('reviews.changes_saved')
              : t('reviews.thanks_reviewing', { name: revieweeName || '' })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-5">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl border border-gray-100 shadow-2xl z-10 max-h-[94vh] flex flex-col overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-sky-500/60 to-primary shrink-0" />

        {/* Header */}
        <div className="flex items-start justify-between px-6 sm:px-8 py-5 sm:py-6 border-b border-gray-100 shrink-0 bg-gradient-to-br from-primary/5 via-white to-sky-50/40">
          <div className="pr-4">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
              {isEdit ? t('reviews.edit_review') : t('reviews.write_review_title')}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-text mt-1 leading-tight">
              {revieweeName || t('reviews.review_user')}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-500 bg-white border border-gray-200 rounded-full px-2.5 py-1">
                {form.reviewerType === 'employer' ? t('reviews.employer') : t('reviews.job_seeker')}
              </span>
            </div>
            {jobTitle && (
              <p className="text-sm text-gray-500 mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white">
                <Briefcase className="w-3.5 h-3.5 text-primary" />
                {jobTitle}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-white hover:text-gray-700 border border-transparent hover:border-gray-200 transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 px-6 sm:px-8 py-6 sm:py-7 overflow-y-auto custom-scrollbar bg-white">
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
            showActions
            isSubmitting={isSubmitting}
            canSubmit={canSubmit}
            submitLabel={isEdit ? t('reviews.save_changes') : t('reviews.submit_review')}
            submittingLabel={isEdit ? t('reviews.saving') : t('reviews.submitting')}
            onCancel={handleClose}
            cancelLabel={t('common.cancel')}
          />
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
