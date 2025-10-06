"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconSearch, IconX, IconLoader2 } from '@tabler/icons-react';
import { useProductSearch } from '@/hooks/useProductSearch';
import Card from './Card';
import Button from './Button';

interface ProductSearchBarProps {
  placeholder?: string;
  isAdmin?: boolean;
  limit?: number;
  className?: string;
  onProductSelect?: (product: any) => void;
}

export default function ProductSearchBar({
  placeholder = "Search products...",
  isAdmin = false,
  limit = 20,
  className = "",
  onProductSelect
}: ProductSearchBarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    searchQuery,
    searchResult,
    isLoading,
    error,
    handleSearch,
    clearSearch,
    shouldSearch
  } = useProductSearch({
    isAdmin,
    limit
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || searchResult.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResult.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResult.length) {
          handleProductClick(searchResult[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleProductClick = (product: any) => {
    if (onProductSelect) {
      onProductSelect(product);
    } else {
      // Navigate to product page
      router.push(`/products/${product.slug}`);
    }
    setIsOpen(false);
    setSelectedIndex(-1);
    clearSearch();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleSearch(value);
    setIsOpen(value.length >= 3);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (searchQuery.length >= 3) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <IconLoader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <IconSearch className="h-4 w-4 text-gray-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <IconX className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && shouldSearch && (
        <Card className="absolute top-full left-0 right-0 mt-1 max-h-96 overflow-y-auto z-50 shadow-lg border border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <IconLoader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              Searching...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              Search failed. Please try again.
            </div>
          ) : searchResult.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No products found for "{searchQuery}"
            </div>
          ) : (
            <div className="py-2">
              {searchResult.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    index === selectedIndex ? 'bg-gray-50 dark:bg-gray-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Product Image */}
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <IconSearch className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {product.category.name}
                      </p>
                      {product.variants && product.variants.length > 0 && (
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          From ₹{Math.min(...product.variants.map(v => v.price))}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
