const TabBadge = ({ count }) => {
  if (!count) return null;

  return (
    <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-medium bg-[#6794D1]/15 text-[#6794D1]">
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default TabBadge;
