const ReviewSkeleton = () => (
  <div className="p-5 bg-surface border border-neutral-100 shadow-sm rounded-xl animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="space-y-2">
        <div className="w-32 h-4 bg-neutral-200 rounded" />
        <div className="w-20 h-3 bg-neutral-100 rounded" />
      </div>
      <div className="w-24 h-4 bg-neutral-200 rounded" />
    </div>
    <div className="flex gap-2 mb-3">
      <div className="w-20 h-5 bg-neutral-100 rounded-full" />
      <div className="w-16 h-5 bg-neutral-100 rounded-full" />
    </div>
    <div className="space-y-2">
      <div className="w-full h-3 bg-neutral-100 rounded" />
      <div className="w-3/4 h-3 bg-neutral-100 rounded" />
    </div>
  </div>
);

export default ReviewSkeleton;
