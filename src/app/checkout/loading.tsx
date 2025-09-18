export default function Loading() {
  return (
    <div className="container py-8">
      <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  );
}


