import React from 'react';

const Block = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

export function ProductGridSkeleton() {
  return (
    <div>
      <Block className="h-44 md:h-64 w-full rounded-3xl mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-3.5 border border-gray-100 shadow-2xs space-y-3">
            <Block className="h-32 w-full" />
            <Block className="h-3.5 w-3/4" />
            <div className="flex items-center justify-between pt-1">
              <Block className="h-3 w-10" />
              <Block className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderListSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <Block className="h-3.5 w-24" />
            <Block className="h-5 w-16 rounded-full" />
          </div>
          <Block className="h-3 w-full" />
          <Block className="h-3 w-2/3" />
          <Block className="h-8 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function MessagesSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <div className="flex justify-start"><Block className="h-10 w-2/3 rounded-2xl" /></div>
      <div className="flex justify-end"><Block className="h-10 w-1/2 rounded-2xl" /></div>
      <div className="flex justify-start"><Block className="h-10 w-3/5 rounded-2xl" /></div>
    </div>
  );
}

export function FavoritesSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-3.5 border border-gray-100 shadow-2xs space-y-3">
          <Block className="h-32 w-full" />
          <Block className="h-3.5 w-3/4" />
        </div>
      ))}
    </div>
  );
}
