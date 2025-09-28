import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
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

        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="mx-auto w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-16 h-16 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-3V6a3 3 0 00-3-3H6a3 3 0 00-3 3v3m5.5 0a.5.5 0 01-.5-.5v-2a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-3z"
              />
            </svg>
          </div>
          
          <div className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-2">
            404
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or the URL might be incorrect.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/">
            <Button variant="primary" className="w-full sm:w-auto">
              Go Home
            </Button>
          </Link>
          
          <Link href="/products">
            <Button variant="secondary" className="w-full sm:w-auto">
              Browse Products
            </Button>
          </Link>
        </div>

        {/* Search Suggestion */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            What were you looking for?
          </h3>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link 
              href="/products" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              🛒 Products
            </Link>
            <Link 
              href="/cart" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              🛍️ Cart
            </Link>
            <Link 
              href="/dashboard" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              📊 Dashboard
            </Link>
            <Link 
              href="/login" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              🔐 Login
            </Link>
          </div>
        </div>

        {/* Support Link */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Still can't find what you're looking for? Try browsing our products or go back to the homepage.
          </p>
        </div>
      </div>
    </div>
  );
}
