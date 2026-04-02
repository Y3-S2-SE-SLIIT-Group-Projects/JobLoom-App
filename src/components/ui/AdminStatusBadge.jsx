const StatusBadge = ({ status, type = 'default' }) => {
  const variants = {
    user: {
      active: 'bg-green-100 text-green-700 border-green-200',
      disabled: 'bg-red-100 text-red-700 border-red-200',
      true: 'bg-green-100 text-green-700 border-green-200',
      false: 'bg-red-100 text-red-700 border-red-200',
    },
    job: {
      open: 'bg-green-100 text-green-700 border-green-200',
      filled: 'bg-blue-100 text-blue-700 border-blue-200',
      closed: 'bg-gray-100 text-gray-700 border-gray-200',
    },
    role: {
      admin: 'bg-purple-100 text-purple-700 border-purple-200',
      employer: 'bg-orange-100 text-orange-700 border-orange-200',
      job_seeker: 'bg-teal-100 text-teal-700 border-teal-200',
    },
    default: {
      success: 'bg-green-100 text-green-700 border-green-200',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      error: 'bg-red-100 text-red-700 border-red-200',
      info: 'bg-blue-100 text-blue-700 border-blue-200',
    },
  };

  const variantSet = variants[type] || variants.default;
  const statusKey = typeof status === 'boolean' ? status.toString() : status?.toLowerCase();
  const colorClass =
    variantSet[statusKey] || variantSet.info || 'bg-gray-100 text-gray-700 border-gray-200';

  const displayText =
    typeof status === 'boolean'
      ? status
        ? 'Active'
        : 'Disabled'
      : status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colorClass} transition-all duration-200`}
    >
      {displayText}
    </span>
  );
};

export default StatusBadge;
