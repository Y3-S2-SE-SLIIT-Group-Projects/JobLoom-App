/**
 * RatingBar
 * Horizontal bar showing what percentage of ratings a given star value has.
 *
 * @param {number} star       - Star level (1-5)
 * @param {number} count      - Count for this star
 * @param {number} total      - Total reviews
 */
const RatingBar = ({ star, count, total }) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="w-4 text-sm text-gray-600 text-right">{star}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-amber-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-xs text-gray-500 text-right">{percentage}%</span>
    </div>
  );
};

export default RatingBar;
