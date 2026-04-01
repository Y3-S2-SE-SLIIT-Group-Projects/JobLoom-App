import { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useReviewForm from '../../hooks/useReviewForm';
import ReviewSuccessScreen from '../../components/reviews/ReviewSuccessScreen';
import ReviewFormHeader from '../../components/reviews/ReviewFormHeader';
import ReviewForm from '../../components/reviews/ReviewForm';

const SubmitReviewPage = () => {
  const { t } = useTranslation();
  const { jobId: paramJobId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const jobId = paramJobId || searchParams.get('jobId') || '';
  const revieweeId = searchParams.get('revieweeId') || '';

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
  } = useReviewForm({ jobId, revieweeId });

  useEffect(() => {
    if (!submittedReview) return;
    const timer = setTimeout(() => {
      resetForm();
      navigate(`/reviews/${submittedReview.revieweeId?._id ?? submittedReview.revieweeId}`);
    }, 2000);
    return () => clearTimeout(timer);
  }, [submittedReview, navigate, resetForm]);

  const canSubmit = form.rating > 0 && form.revieweeId && form.jobId && !isSubmitting;

  if (submittedReview) return <ReviewSuccessScreen />;

  return (
    <div className="min-h-screen bg-background">
      <ReviewFormHeader />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white border border-gray-100 shadow-card rounded-2xl p-6">
          <ReviewForm
            form={form}
            setField={setField}
            handleChange={handleChange}
            handleImageChange={handleImageChange}
            removeImage={removeImage}
            images={images}
            imagePreviews={imagePreviews}
            submitError={submitError}
            showRevieweeField={!revieweeId}
            showJobIdField={!jobId}
            formId="submit-review-form"
            onSubmit={handleSubmit}
            showActions
            isSubmitting={isSubmitting}
            canSubmit={canSubmit}
            submitLabel={t('reviews.submit_review')}
            submittingLabel={t('reviews.submitting')}
            onCancel={() => navigate(-1)}
            cancelLabel={t('common.cancel')}
          />
        </div>
      </div>
    </div>
  );
};

export default SubmitReviewPage;
