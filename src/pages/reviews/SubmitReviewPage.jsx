import { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import useReviewForm from '../../hooks/useReviewForm';
import Spinner from '../../components/ui/Spinner';
import ReviewSuccessScreen from '../../components/reviews/ReviewSuccessScreen';
import ReviewFormHeader from '../../components/reviews/ReviewFormHeader';
import ReviewForm from '../../components/reviews/ReviewForm';

const SubmitReviewPage = () => {
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
    <div className="min-h-screen bg-surface-muted">
      <ReviewFormHeader />
      <div className="max-w-2xl px-6 py-8 mx-auto">
        <div className="p-6 bg-surface border border-border shadow-sm rounded-2xl">
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
          >
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-neutral-100">
              <Link to={-1} className="text-sm text-subtle hover:text-primary transition-colors">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={!canSubmit}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && <Spinner size="sm" />}
                {isSubmitting ? 'Submitting\u2026' : 'Submit Review'}
              </button>
            </div>
          </ReviewForm>
        </div>
      </div>
    </div>
  );
};

export default SubmitReviewPage;
