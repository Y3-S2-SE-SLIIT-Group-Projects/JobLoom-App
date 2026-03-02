import CriteriaBar from './CriteriaBar';
import { CRITERIA_CONFIG } from '../../constants/reviewConstants';

/**
 * ReviewCriteriaDisplay
 * Renders detailed sub-criteria ratings (work quality, communication, etc.)
 * Only renders criteria that are present on the review object.
 */
const ReviewCriteriaDisplay = ({ review }) => {
  const visibleCriteria = CRITERIA_CONFIG.filter(({ key, showFor }) => {
    if (review[key] == null) return false;
    if (showFor === 'both') return true;
    return review.reviewerType === (showFor === 'job_seeker' ? 'employer' : 'job_seeker');
  });

  if (visibleCriteria.length === 0) return null;

  return (
    <div className="space-y-2 mt-3">
      {visibleCriteria.map(({ key, label }) => (
        <CriteriaBar key={key} label={label} value={review[key]} />
      ))}
    </div>
  );
};

export default ReviewCriteriaDisplay;
