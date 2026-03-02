/**
 * EmptyState
 * Displayed when a list has no items to show.
 *
 * @param {ReactNode} icon     - Optional icon element
 * @param {string}    title    - Primary message
 * @param {string}    message  - Secondary explanation
 * @param {ReactNode} action   - Optional CTA button/link
 */
const EmptyState = ({ icon, title = 'Nothing here yet', message, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {icon && <div className="text-5xl text-gray-300 mb-4">{icon}</div>}
    <p className="text-lg font-semibold text-gray-700">{title}</p>
    {message && <p className="mt-1 text-sm text-gray-500 max-w-sm">{message}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
