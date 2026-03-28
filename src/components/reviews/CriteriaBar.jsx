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
      <div className="flex justify-between text-xs text-subtle mb-0.5">
        <span>{label}</span>
        <span className="font-medium text-muted">{value}/5</span>
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default CriteriaBar;
