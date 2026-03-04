import { FaThumbsDown } from 'react-icons/fa';

const ReviewErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-red-50">
      <FaThumbsDown className="w-5 h-5 text-red-400" />
    </div>
    <p className="text-sm text-red-600">{message || 'Failed to load recommendations.'}</p>
  </div>
);

export default ReviewErrorState;
