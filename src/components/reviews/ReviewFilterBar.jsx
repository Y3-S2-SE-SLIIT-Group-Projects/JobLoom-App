import { FILTER_OPTIONS, SORT_OPTIONS } from '../../constants/reviewConstants';

/**
 * ReviewFilterBar
 * Controls for filtering and sorting the reviews list.
 *
 * @param {string}   reviewerType   - Current filter value
 * @param {Function} onFilterChange - Called with new reviewerType string
 * @param {string}   sort           - Current sort value
 * @param {Function} onSortChange   - Called with new sort string
 */

const ReviewFilterBar = ({ reviewerType, onFilterChange, sort, onSortChange }) => (
  <div className="flex flex-wrap items-center gap-3">
    {/* Type filter pills */}
    <div className="flex gap-2">
      {FILTER_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onFilterChange(value)}
          className={[
            'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
            reviewerType === value
              ? 'bg-primary text-white border-primary'
              : 'bg-surface text-muted border-border hover:border-primary',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>

    {/* Sort dropdown */}
    <select
      value={sort}
      onChange={e => onSortChange(e.target.value)}
      className="ml-auto text-sm border border-border rounded-lg px-3 py-1.5 bg-surface text-muted focus:outline-none focus:border-primary"
    >
      {SORT_OPTIONS.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  </div>
);

export default ReviewFilterBar;
