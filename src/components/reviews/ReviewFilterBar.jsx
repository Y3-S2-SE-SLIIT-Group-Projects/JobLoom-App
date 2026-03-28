import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowUpDown } from 'lucide-react';
import {
  setReviewerType as setReviewerTypeAction,
  setSort as setSortAction,
  selectReviewerTypeFilter,
  selectReviewSort,
} from '../../store/slices/reviewSlice';

const FILTER_OPTIONS = [
  { value: '', key: 'reviews.filter_all' },
  { value: 'employer', key: 'reviews.filter_employer' },
  { value: 'job_seeker', key: 'reviews.filter_job_seeker' },
];

const SORT_OPTIONS = [
  { value: '-createdAt', key: 'reviews.sort_newest' },
  { value: 'createdAt', key: 'reviews.sort_oldest' },
  { value: '-rating', key: 'reviews.sort_highest' },
  { value: 'rating', key: 'reviews.sort_lowest' },
];

const ReviewFilterBar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const reviewerType = useSelector(selectReviewerTypeFilter);
  const sort = useSelector(selectReviewSort);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1 p-1 bg-gray-50 border border-gray-100 rounded-xl">
        {FILTER_OPTIONS.map(({ value, key }) => (
          <button
            key={value}
            type="button"
            onClick={() => dispatch(setReviewerTypeAction(value))}
            className={[
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
              reviewerType === value
                ? 'bg-white text-text shadow-sm ring-1 ring-gray-200'
                : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {t(key)}
          </button>
        ))}
      </div>

      <div className="relative ml-auto">
        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <select
          value={sort}
          onChange={e => dispatch(setSortAction(e.target.value))}
          className="pl-8 pr-4 py-2 text-xs font-medium border border-gray-200 rounded-xl bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer transition-colors"
        >
          {SORT_OPTIONS.map(({ value, key }) => (
            <option key={value} value={value}>
              {t(key)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ReviewFilterBar;
