import { FaInbox } from 'react-icons/fa';

const AdminEmptyState = ({
  icon: Icon = FaInbox,
  title = 'No data found',
  description = 'Try adjusting your filters or search criteria',
  action,
  actionLabel,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 text-center mb-6 max-w-sm">{description}</p>
      {action && actionLabel && (
        <button
          onClick={action}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default AdminEmptyState;
