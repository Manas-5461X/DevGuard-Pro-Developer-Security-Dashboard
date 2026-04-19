import React from 'react';

export function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-[#1A1A1A] rounded-md ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-12 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="border-b border-cyber-border pb-4">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="cyber-panel p-6">
            <Skeleton className="h-3 w-32 mb-4" />
            <Skeleton className="h-12 w-20 mb-3" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-56" />
        <div className="cyber-panel overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="p-4 border-b border-cyber-border flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="border-b border-cyber-border pb-4">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-4 mt-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="cyber-panel p-6 flex flex-col md:flex-row items-center justify-between">
            <div className="flex gap-8 items-center">
              <div>
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-5 w-40" />
              </div>
              <div>
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
