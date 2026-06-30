import React from "react";

export const CardSkeleton: React.FC = () => {
  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/5 animate-pulse">
      {/* Thumbnail */}
      <div className="h-48 w-full bg-white/5" />
      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Category & Badge */}
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-white/5 rounded-full" />
          <div className="h-5 w-24 bg-white/5 rounded-full" />
        </div>
        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 w-5/6 bg-white/5 rounded" />
          <div className="h-6 w-3/4 bg-white/5 rounded" />
        </div>
        {/* Meta info */}
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 w-28 bg-white/5 rounded" />
          <div className="h-6 w-16 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="glass rounded-xl overflow-hidden border border-white/5 p-4 space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="h-6 w-32 bg-white/5 rounded" />
        <div className="h-8 w-24 bg-white/5 rounded" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex justify-between items-center py-3 border-b border-white/5 last:border-b-0">
          <div className="space-y-2 flex-1">
            <div className="h-5 w-1/3 bg-white/5 rounded" />
            <div className="h-4 w-1/4 bg-white/5 rounded" />
          </div>
          <div className="h-8 w-16 bg-white/5 rounded" />
        </div>
      ))}
    </div>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-[350px] w-full bg-white/5 rounded-3xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-10 w-2/3 bg-white/5 rounded" />
          <div className="h-6 w-1/4 bg-white/5 rounded" />
          <div className="h-32 w-full bg-white/5 rounded-2xl" />
        </div>
        <div className="glass rounded-2xl border border-white/5 p-6 h-64 space-y-4">
          <div className="h-6 w-1/2 bg-white/5 rounded" />
          <div className="h-12 w-full bg-white/5 rounded-xl" />
          <div className="h-12 w-full bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
