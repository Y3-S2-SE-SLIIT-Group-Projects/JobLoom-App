import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { FaCamera, FaTimes } from 'react-icons/fa';
import StarRating from '../ui/StarRating';
import AlertBanner from '../ui/AlertBanner';
import CriteriaInput from './CriteriaInput';
import FormTextField from '../ui/FormTextField';

/**
 * ReviewForm
 * Shared form body used by SubmitReviewPage (full page) and ReviewModal (overlay).
 * Renders a <form> tag so an external submit button can target it via form={formId}.
 *
 * Props:
 *   form, setField, handleChange           – from useReviewForm
 *   handleImageChange, removeImage         – image handlers from useReviewForm
 *   images, imagePreviews                  – image state from useReviewForm
 *   submitError        {string|null}       – shown in AlertBanner
 *   showRevieweeField  {boolean}           – render raw revieweeId text input
 *   showJobIdField     {boolean}           – render raw jobId text input
 *   formId             {string}            – html id for <form> element
 *   onSubmit           {Function}          – form submit handler
 *   commentFieldId     {string}            – id for <textarea> (avoid duplicate ids)
 *   children                               – optional extra content at the bottom (e.g. page footer)
 */
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
  children,
}) => {
  const fileInputRef = useRef(null);
  const currentUser = useSelector(state => state.user?.currentUser);
  const isEmployer = form.reviewerType === 'employer';

  return (
    <form id={formId} onSubmit={onSubmit} noValidate>
      <div className="space-y-5">
        <AlertBanner type="error" message={submitError} />

        {/* Role badge — read-only, derived from logged-in account */}
        <div className="flex items-center gap-3 px-4 py-3 border border-blue-100 bg-blue-50 rounded-xl">
          <span className="text-sm text-[#6794D1] font-medium">Reviewing as</span>
          <span className="px-3 py-1 rounded-full bg-[#6794D1] text-white text-xs font-semibold">
            {isEmployer ? 'Employer' : 'Job Seeker'}
          </span>
          {currentUser && (
            <span className="ml-auto text-xs text-gray-500">
              {currentUser.firstName} {currentUser.lastName}
            </span>
          )}
        </div>

        {showRevieweeField && (
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
        {showJobIdField && (
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
          <label className="block mb-2 text-sm font-semibold text-gray-700">
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

        {/* Detailed Criteria — tailored to reviewer role */}
        <div>
          <p className="mb-1 text-sm font-semibold text-gray-700">
            Detailed Ratings <span className="font-normal text-gray-400">(optional)</span>
          </p>
          <p className="mb-2 text-xs text-gray-400">
            {isEmployer
              ? 'Rate the job seeker on the criteria below.'
              : 'Rate the employer on the criteria below.'}
          </p>
          <div className="px-4 py-2 border border-gray-200 rounded-xl">
            {isEmployer ? (
              // Employer reviewing a job seeker
              <>
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
                <CriteriaInput
                  label="Punctuality"
                  field="punctuality"
                  value={form.punctuality}
                  onChange={setField}
                />
              </>
            ) : (
              // Job seeker reviewing an employer
              <>
                <CriteriaInput
                  label="Communication"
                  field="communication"
                  value={form.communication}
                  onChange={setField}
                />
                <CriteriaInput
                  label="Payment on Time"
                  field="paymentOnTime"
                  value={form.paymentOnTime}
                  onChange={setField}
                />
              </>
            )}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label
            className="block mb-1 text-sm font-semibold text-gray-700"
            htmlFor={commentFieldId}
          >
            Comment
          </label>
          <textarea
            id={commentFieldId}
            name="comment"
            rows={4}
            maxLength={1000}
            placeholder="Share details about your experience…"
            value={form.comment}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-[#6794D1]"
          />
          <p className="mt-1 text-xs text-right text-gray-400">{form.comment.length}/1000</p>
        </div>

        {/* Image Upload */}
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">
            Attach Photos <span className="font-normal text-gray-400">(optional, max 5)</span>
          </p>
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {imagePreviews.map((src, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 overflow-hidden border border-gray-200 shadow-sm group rounded-xl"
                >
                  <img src={src} alt={`preview-${i}`} className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/40 group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <FaTimes className="text-lg text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {images.length < 5 && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={e => handleImageChange(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-[#6794D1] hover:text-[#6794D1] transition-colors"
              >
                <FaCamera />
                {images.length === 0 ? 'Add photos' : `Add more (${images.length}/5)`}
              </button>
            </>
          )}
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

        {/* Footer slot — page uses this for cancel/submit buttons */}
        {children}
      </div>
    </form>
  );
};

export default ReviewForm;
