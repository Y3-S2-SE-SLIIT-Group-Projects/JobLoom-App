import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

/**
 * StarRating
 * Renders 5 stars as a display or interactive input.
 *
 * @param {number}   value      - Current rating value (1-5, decimals supported in display mode)
 * @param {boolean}  interactive - Allow click to set rating
 * @param {Function} onChange   - Called with new value when a star is clicked (interactive only)
 * @param {string}   size       - Tailwind text size class e.g. "text-lg"
 */
const StarRating = ({ value = 0, interactive = false, onChange, size = 'text-lg' }) => {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  const getIcon = position => {
    if (value >= position) return FaStar;
    if (value >= position - 0.5) return FaStarHalfAlt;
    return FaRegStar;
  };

  return (
    <div className="flex items-center gap-0.5">
      {stars.map(position => {
        const Icon = getIcon(position);
        return (
          <button
            key={position}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onChange ? () => onChange(position) : undefined}
            className={[
              size,
              'transition-transform',
              position <= value ? 'text-amber-400' : 'text-gray-300',
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
            ].join(' ')}
            aria-label={interactive ? `Rate ${position} out of 5` : undefined}
            disabled={!interactive}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
