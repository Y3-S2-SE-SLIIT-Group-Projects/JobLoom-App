import { FaCheckCircle } from 'react-icons/fa';

/**
 * ReviewSuccessScreen
 * Full-screen confirmation shown after a review is submitted successfully.
 */
const ReviewSuccessScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-muted">
    <div className="bg-surface rounded-2xl shadow-md p-10 text-center max-w-sm">
      <FaCheckCircle className="text-5xl text-success mx-auto mb-4" />
      <h2 className="text-xl font-bold text-text-dark">Review Submitted!</h2>
      <p className="text-sm text-subtle mt-2">Redirecting to profile…</p>
    </div>
  </div>
);

export default ReviewSuccessScreen;
