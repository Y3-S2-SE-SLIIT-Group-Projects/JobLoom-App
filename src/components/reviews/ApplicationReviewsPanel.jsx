import { useState } from 'react';
import { FaStar, FaPen, FaLock } from 'react-icons/fa';
import useJobReviews from '../../hooks/useJobReviews';
import ReviewModal from './ReviewModal';
import ReviewCard from './ReviewCard';
import Spinner from '../ui/Spinner';

/**
 * ApplicationReviewsPanel
 * Embeddable component — drop into any application detail card/page.
 * Shows the two reviews exchanged for a specific job application, plus a
 * "Write a Review" button when the application is accepted and the current
 * user hasn't reviewed yet.
 *
 * Props:
 *   jobId            {string}  – required
 *   employerId       {string}  – required
 *   jobSeekerId      {string}  – required
 *   currentUserId    {string}  – required  (currently logged-in user's ID)
 *   applicationStatus {string} – 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn'
 *   employerName     {string}  – displayed in review modal header
 *   seekerName       {string}  – displayed in review modal header
 *   jobTitle         {string}  – displayed in review modal header
 *
 * How to plug in from an application card:
 *   <ApplicationReviewsPanel
 *     jobId={app.jobId}
 *     employerId={app.employerId}
 *     jobSeekerId={app.jobSeekerId}
 *     currentUserId={currentUser._id}
 *     applicationStatus={app.status}
 *     employerName={`${app.employer.firstName} ${app.employer.lastName}`}
 *     seekerName={`${app.seeker.firstName} ${app.seeker.lastName}`}
 *     jobTitle={app.job.title}
 *   />
 */
const ApplicationReviewsPanel = ({
  jobId,
  employerId,
  jobSeekerId,
  currentUserId,
  applicationStatus,
  employerName = 'Employer',
  seekerName = 'Applicant',
  jobTitle = '',
}) => {
  const { reviews, isLoading } = useJobReviews(jobId);
  const [modalOpen, setModalOpen] = useState(false);

  const isAccepted = applicationStatus === 'accepted';

  // Derive which review belongs to which direction
  // seekerReview: job seeker reviewed the employer (reviewerType = 'job_seeker')
  const seekerReview = reviews.find(
    r =>
      r.reviewerType === 'job_seeker' &&
      (r.reviewerId?._id ?? r.reviewerId)?.toString() === jobSeekerId?.toString()
  );
  // employerReview: employer reviewed the job seeker (reviewerType = 'employer')
  const employerReview = reviews.find(
    r =>
      r.reviewerType === 'employer' &&
      (r.reviewerId?._id ?? r.reviewerId)?.toString() === employerId?.toString()
  );

  // Has the current user already written a review for this job?
  const hasCurrentUserReviewed = reviews.some(
    r => (r.reviewerId?._id ?? r.reviewerId)?.toString() === currentUserId?.toString()
  );

  // Who is the current user — employer or seeker?
  const isCurrentUserEmployer = currentUserId?.toString() === employerId?.toString();
  const isCurrentUserSeeker = currentUserId?.toString() === jobSeekerId?.toString();
  const isParticipant = isCurrentUserEmployer || isCurrentUserSeeker;

  // Pre-fill for the modal
  const modalRevieweeId = isCurrentUserEmployer ? jobSeekerId : employerId;
  const modalRevieweeType = isCurrentUserEmployer ? 'employer' : 'job_seeker';
  const modalRevieweeName = isCurrentUserEmployer ? seekerName : employerName;

  const canWriteReview = isAccepted && isParticipant && !hasCurrentUserReviewed;

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaStar className="text-sm text-secondary" />
          <h3 className="text-sm font-bold text-text-dark">Reviews</h3>
          {reviews.length > 0 && (
            <span className="text-xs bg-neutral-100 text-subtle rounded-full px-2 py-0.5">
              {reviews.length}
            </span>
          )}
        </div>

        {/* Write Review button */}
        {isAccepted &&
          isParticipant &&
          (canWriteReview ? (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              <FaPen className="text-xs" />
              Write a Review
            </button>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-success">
              <FaStar className="text-xs" />
              Review submitted
            </span>
          ))}

        {/* Not accepted — show why reviews are locked */}
        {!isAccepted && (
          <span className="flex items-center gap-1 text-xs text-subtle">
            <FaLock className="text-xs" />
            {applicationStatus === 'rejected'
              ? 'Reviews only available for accepted applications'
              : 'Available after acceptance'}
          </span>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-6">
          <Spinner size="sm" />
        </div>
      )}

      {/* No reviews yet */}
      {!isLoading && reviews.length === 0 && (
        <p className="py-4 text-xs text-center text-subtle">
          {isAccepted
            ? 'No reviews yet for this job. Be the first to leave one!'
            : 'Reviews will be available once the application is accepted.'}
        </p>
      )}

      {/* Seeker → Employer review */}
      {seekerReview && (
        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-subtle uppercase">
            {seekerName}&rsquo;s review of {employerName}
          </p>
          <ReviewCard review={seekerReview} currentUserId={currentUserId} showActions />
        </div>
      )}

      {/* Employer → Seeker review */}
      {employerReview && (
        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-subtle uppercase">
            {employerName}&rsquo;s review of {seekerName}
          </p>
          <ReviewCard review={employerReview} currentUserId={currentUserId} showActions />
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        jobId={jobId}
        revieweeId={modalRevieweeId}
        reviewerType={modalRevieweeType}
        revieweeName={modalRevieweeName}
        jobTitle={jobTitle}
        onSuccess={() => setModalOpen(false)}
      />
    </div>
  );
};

export default ApplicationReviewsPanel;
