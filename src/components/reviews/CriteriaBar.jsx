/**
 * CriteriaBar
 * Single horizontal progress bar for a review sub-criterion.
 *
 * @param {string} label - Criterion label
 * @param {number} value - Score (1–5)
 */
const CriteriaBar = ({ label, value }) => {
  const percentage = (value / 5) * 100;

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-0.5">
        <span>{label}</span>
        <span className="font-medium text-gray-700">{value}/5</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-[#6794D1] h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default CriteriaBar;
