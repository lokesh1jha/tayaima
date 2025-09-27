"use client";

export default function CSSTest() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        CSS Test Component
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tailwind Classes Test */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Tailwind Classes
          </h2>
          <div className="space-y-3">
            <div className="w-full h-4 bg-blue-500 rounded"></div>
            <div className="w-3/4 h-4 bg-green-500 rounded"></div>
            <div className="w-1/2 h-4 bg-red-500 rounded"></div>
          </div>
        </div>

        {/* Custom CSS Variables Test */}
        <div className="p-6 rounded-lg shadow-lg" style={{ 
          backgroundColor: 'var(--color-surface)', 
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)'
        }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>
            CSS Variables
          </h2>
          <div className="space-y-3">
            <div className="w-full h-4 rounded" style={{ backgroundColor: 'var(--color-primary)' }}></div>
            <div className="w-3/4 h-4 rounded" style={{ backgroundColor: 'var(--color-secondary)' }}></div>
            <div className="w-1/2 h-4 rounded" style={{ backgroundColor: 'var(--color-accent)' }}></div>
          </div>
        </div>

        {/* Button Styles Test */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Button Styles
          </h2>
          <div className="space-y-3">
            <button className="btn-primary w-full">Primary Button</button>
            <button className="btn-secondary w-full">Secondary Button</button>
            <button className="btn-accent w-full">Accent Button</button>
          </div>
        </div>
      </div>

      {/* Responsive Test */}
      <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Responsive Test</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 p-4 rounded text-center">Mobile</div>
          <div className="bg-white bg-opacity-20 p-4 rounded text-center hidden sm:block">Tablet</div>
          <div className="bg-white bg-opacity-20 p-4 rounded text-center hidden md:block">Desktop</div>
          <div className="bg-white bg-opacity-20 p-4 rounded text-center hidden lg:block">Large</div>
        </div>
      </div>

      {/* Animation Test */}
      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Animation Test
        </h2>
        <div className="flex space-x-4">
          <div className="w-16 h-16 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-16 h-16 bg-green-500 rounded-full animate-bounce"></div>
          <div className="w-16 h-16 bg-red-500 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
