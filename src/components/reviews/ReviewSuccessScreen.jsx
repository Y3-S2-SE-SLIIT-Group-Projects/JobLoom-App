import { FaCheckCircle } from 'react-icons/fa';

/**
 * ReviewSuccessScreen
 * Full-screen confirmation shown after a review is submitted successfully.
 */
const ReviewSuccessScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
    <div className="bg-white rounded-2xl shadow-md p-10 text-center max-w-sm">
      <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-[#2B373F]">Review Submitted!</h2>
      <p className="text-sm text-gray-500 mt-2">Redirecting to profile…</p>
    </div>
  </div>
);

export default ReviewSuccessScreen;
