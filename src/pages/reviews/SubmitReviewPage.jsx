import { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import useReviewForm from '../../hooks/useReviewForm';
import StarRating from '../../components/ui/StarRating';
import AlertBanner from '../../components/ui/AlertBanner';
import Spinner from '../../components/ui/Spinner';
import FormTextField from '../../components/ui/FormTextField';
import CriteriaInput from '../../components/reviews/CriteriaInput';
import ReviewSuccessScreen from '../../components/reviews/ReviewSuccessScreen';
import ReviewFormHeader from '../../components/reviews/ReviewFormHeader';
import ReviewerTypeToggle from '../../components/reviews/ReviewerTypeToggle';

/**
 * SubmitReviewPage  –  /reviews/submit/:jobId  or  /reviews/submit?jobId=&revieweeId=
 * Lets an authenticated user submit a review for a completed job.
 */
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

  const isEmployer = form.reviewerType === 'employer';
  const canSubmit = form.rating > 0 && form.revieweeId && form.jobId && !isSubmitting;

  if (submittedReview) return <ReviewSuccessScreen />;

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <ReviewFormHeader />

      <div className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <AlertBanner type="error" message={submitError} />

            <ReviewerTypeToggle
              value={form.reviewerType}
              onChange={v => setField('reviewerType', v)}
            />

            {!revieweeId && (
              <FormTextField
                id="revieweeId"
                name="revieweeId"
                label="Reviewee ID"
                placeholder="User ID being reviewed"
                value={form.revieweeId}
                onChange={handleChange}
                required
              />
            )}
            {!jobId && (
              <FormTextField
                id="jobId"
                name="jobId"
                label="Job ID"
                placeholder="Job ID for this review"
                value={form.jobId}
                onChange={handleChange}
                required
              />
            )}

            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Overall Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <StarRating
                  value={form.rating}
                  interactive
                  onChange={v => setField('rating', v)}
                  size="text-3xl"
                />
                {form.rating > 0 && (
                  <span className="text-2xl font-bold text-amber-500">{form.rating}.0</span>
                )}
              </div>
            </div>

            {/* Detailed Criteria */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Detailed Ratings <span className="text-gray-400 font-normal">(optional)</span>
              </p>
              <div className="rounded-xl border border-gray-200 px-4 py-2">
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
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="comment">
                Comment
              </label>
              <textarea
                id="comment"
                name="comment"
                rows={4}
                maxLength={1000}
                placeholder="Share details about your experience…"
                value={form.comment}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-[#6794D1]"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.comment.length}/1000</p>
            </div>

            {/* Would Recommend */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="wouldRecommend"
                checked={form.wouldRecommend}
                onChange={handleChange}
                className="w-4 h-4 accent-[#6794D1]"
              />
              <span className="text-sm text-gray-700">I would recommend this person</span>
            </label>

            {/* Submit */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-100">
              <Link
                to={-1}
                className="text-sm text-gray-500 hover:text-[#6794D1] transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={!canSubmit}
                className="px-6 py-2.5 bg-[#6794D1] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && <Spinner size="sm" />}
                {isSubmitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitReviewPage;
