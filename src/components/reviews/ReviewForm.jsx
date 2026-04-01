import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AlertBanner from '../ui/AlertBanner';
import FormTextField from '../ui/FormTextField';
import DetailedRatingsSection from './sections/DetailedRatingsSection';
import CommentRecommendationSection from './sections/CommentRecommendationSection';
import PhotosSubmitSection from './sections/PhotosSubmitSection';

const SECTIONS = [
  { id: 1, key: 'reviews.section_detailed' },
  { id: 2, key: 'reviews.section_comment' },
  { id: 3, key: 'reviews.section_photos' },
];

const ReviewForm = ({
  form,
  setField,
  handleChange,
  handleImageChange,
  removeImage,
  images,
  imagePreviews,
  submitError,
  showRevieweeField = false,
  showJobIdField = false,
  formId = 'review-form',
  onSubmit,
  commentFieldId = 'comment',
  showActions = false,
  isSubmitting = false,
  canSubmit = false,
  submitLabel,
  submittingLabel,
  onCancel,
  cancelLabel,
  children,
}) => {
  const { t } = useTranslation();
  const isEmployer = form.reviewerType === 'employer';
  const [step, setStep] = useState(1);

  const goNext = () => setStep(s => Math.min(3, s + 1));
  const goPrev = () => setStep(s => Math.max(1, s - 1));

  return (
    <form id={formId} onSubmit={onSubmit} noValidate className="space-y-6">
      <AlertBanner type="error" message={submitError} />

      {/* Step progress */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
          <span>{t('reviews.section_x_of_y', { current: step, total: 3 })}</span>
          <span className="font-medium text-gray-500">{t(SECTIONS[step - 1].key)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {SECTIONS.map(s => (
            <div key={s.id} className="h-1 rounded-full overflow-hidden bg-gray-100">
              <div
                className={`h-full rounded-full transition-all duration-400 ${
                  s.id <= step ? 'bg-primary/80' : ''
                }`}
                style={{ width: s.id <= step ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>
      </div>

      {showRevieweeField && (
        <FormTextField
          id="revieweeId"
          name="revieweeId"
          label={t('reviews.reviewee_id_label')}
          placeholder={t('reviews.reviewee_id_placeholder')}
          value={form.revieweeId}
          onChange={handleChange}
          required
        />
      )}
      {showJobIdField && (
        <FormTextField
          id="jobId"
          name="jobId"
          label={t('reviews.job_id_label')}
          placeholder={t('reviews.job_id_placeholder')}
          value={form.jobId}
          onChange={handleChange}
          required
        />
      )}

      {/* Step content */}
      {step === 1 && (
        <DetailedRatingsSection
          form={form}
          isEmployer={isEmployer}
          setField={setField}
          onPrev={goPrev}
          onNext={goNext}
          showPrev={false}
        />
      )}
      {step === 2 && (
        <CommentRecommendationSection
          form={form}
          handleChange={handleChange}
          commentFieldId={commentFieldId}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
      {step === 3 && (
        <PhotosSubmitSection
          images={images}
          imagePreviews={imagePreviews}
          handleImageChange={handleImageChange}
          removeImage={removeImage}
          onPrev={goPrev}
          showActions={showActions}
          onCancel={onCancel}
          cancelLabel={cancelLabel || t('common.cancel')}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          submitLabel={submitLabel || t('reviews.submit_review')}
          submittingLabel={submittingLabel || t('reviews.submitting')}
        />
      )}

      {children}
    </form>
  );
};

export default ReviewForm;
