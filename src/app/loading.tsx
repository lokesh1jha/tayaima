import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <Image
              src="/tayaima-logo.jpeg"
              alt="TaYaima Logo"
              width={48}
              height={48}
              className="rounded-lg object-contain"
            />
            <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">
              TaYaima
            </span>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
        </div>

        {/* Loading Text */}
        <p className="text-gray-600 dark:text-gray-400 animate-pulse">
          Loading your fresh groceries...
        </p>
      </div>
    </div>
  );
}
