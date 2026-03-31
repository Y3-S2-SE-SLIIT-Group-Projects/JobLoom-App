import { FaThumbsDown } from 'react-icons/fa';

const ReviewErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-error/10">
      <FaThumbsDown className="w-5 h-5 text-error" />
    </div>
    <p className="text-sm text-error">{message || 'Failed to load recommendations.'}</p>
  </div>
);

export default ReviewErrorState;
