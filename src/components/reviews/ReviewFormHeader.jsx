import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

/**
 * ReviewFormHeader
 * Page header with a back button and title for the submit review form.
 */
const ReviewFormHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-2xl mx-auto flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-gray-500 hover:text-[#6794D1] hover:bg-blue-50 transition-colors"
          aria-label="Go back"
        >
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#2B373F]">Write a Review</h1>
          <p className="text-sm text-gray-500">Share your experience to help the community</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewFormHeader;
