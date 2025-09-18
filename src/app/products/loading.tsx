export default function Loading() {
  return (
    <div className="container max-w-[1400px] py-8">
      <div className="mb-6">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="mt-4 max-w-md h-10 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="p-2 sm:p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="aspect-square w-full bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="mt-2 h-4 w-3/4 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="mt-2 h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}


