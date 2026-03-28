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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          </div>
          <p className="text-base font-bold text-text">
            {isEdit ? t('reviews.review_updated') : t('reviews.review_submitted')}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            {isEdit
              ? t('reviews.changes_saved')
              : t('reviews.thanks_reviewing', { name: revieweeName || '' })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top accent */}
        <div className="h-1 w-full bg-primary shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">
              {isEdit ? t('reviews.edit_review') : t('reviews.write_review_title')}
            </p>
            <h2 className="text-base font-bold text-text mt-0.5">
              {revieweeName || t('reviews.review_user')}
            </h2>
            {jobTitle && (
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {jobTitle}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 px-6 py-5 overflow-y-auto custom-scrollbar">
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
