/**
 * Spinner
 * Centered loading indicator.
 *
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} className - Additional classes
 */
const SIZE_MAP = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};

const Spinner = ({ size = 'md', className = '' }) => (
  <div className={`flex justify-center items-center ${className}`}>
    <div
      className={`${SIZE_MAP[size]} animate-spin rounded-full border-[#6794D1] border-t-transparent`}
    />
  </div>
);

export default Spinner;
