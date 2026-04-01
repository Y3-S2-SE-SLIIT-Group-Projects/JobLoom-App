const CriteriaBar = ({ label, value }) => {
  const pct = (value / 5) * 100;

  const color = value >= 4 ? 'bg-emerald-500' : value >= 3 ? 'bg-primary' : 'bg-amber-400';

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-32 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-6 text-right">{value}</span>
    </div>
  );
};

export default CriteriaBar;
