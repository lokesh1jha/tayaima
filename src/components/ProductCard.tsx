"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { AddToCartButton } from "./cart/AddToCartButton";

interface ProductVariant {
  id: string;
  unit: string;
  amount: number;
  price: number;
  originalPrice?: number | null;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  variants?: ProductVariant[]; // Optional since API might not include variants
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  priority?: boolean; // For image loading priority
}

export default function ProductCard({ product, compact = false, priority = false }: ProductCardProps) {
  const imageUrl = product.images[0] || '/placeholder-product.jpg';

  // Handle cases where variants might not be loaded
  const variants = product.variants || [];
  const hasVariants = variants.length > 0;

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants[0]?.id || null
  );
  const [imageLoaded, setImageLoaded] = useState(false);

  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;
    return variants.find(v => v.id === selectedVariantId) || variants[0];
  }, [variants, selectedVariantId, hasVariants]);

  const minPrice = hasVariants ? Math.min(...variants.map(v => v.price)) : 0;
  const maxPrice = hasVariants ? Math.max(...variants.map(v => v.price)) : 0;

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price / 100);
    // Remove .00 for whole numbers
    return formatted.replace(/\.00$/, '');
  };

  const formatUnit = (unit: string, amount: number) => {
    const unitMap: { [key: string]: string } = {
      PIECE: "piece",
      KG: "kg",
      G: "g",
      LITER: "L",
      ML: "ml",
      OTHER: "unit",
    };
    return `${amount}${unitMap[unit] || unit.toLowerCase()}`;
  };

  return (
    <Card className={`${compact ? 'p-1.5 sm:p-2' : 'p-2 sm:p-3 md:p-4'} hover:shadow-lg transition-shadow flex flex-col h-full`}>
      {/* Content section - takes up available space */}
      <div className="flex-1 flex flex-col">
        <Link href={`/products/${product.slug}`} className="block">
          <div className={`${compact ? 'mb-2' : 'mb-2 sm:mb-3 md:mb-4'} aspect-square relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden`}>
            {/* Skeleton/Loading state */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
            )}
            
            {imageUrl.includes('.s3.') || imageUrl.includes('amazonaws.com') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={`${product.name} - Fresh ${product.name.toLowerCase()} available for delivery from TaYaima grocery store`}
                className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading={priority ? 'eager' : 'lazy'}
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              <Image
                src={imageUrl}
                alt={`${product.name} - Fresh ${product.name.toLowerCase()} available for delivery from TaYaima grocery store`}
                fill
                className={`object-cover rounded-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading={priority ? 'eager' : 'lazy'}
                priority={priority}
                onLoad={() => setImageLoaded(true)}
              />
            )}
          </div>
          <h3 className={`font-semibold ${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base md:text-lg'} line-clamp-2`}>{product.name}</h3>
        </Link>

        {/* Category */}
        {product.category && (
          <div className={`${compact ? 'mt-1' : 'mt-1 sm:mt-2'}`}>
            <Link 
              href={`/products?categoryId=${product.category.id}`}
              className="inline-block"
              onClick={(e) => e.stopPropagation()} // Prevent triggering the product link
            >
              <span className={`${compact ? 'text-xs' : 'text-xs sm:text-sm'} text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors`}>
                {product.category.name}
              </span>
            </Link>
          </div>
        )}

        {/* Price and Variant Row */}
        <div className={`${compact ? 'mt-2' : 'mt-2 sm:mt-3'} flex items-center justify-between gap-2`}>
          <div className={`${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base md:text-lg'} font-bold text-green-600 flex-shrink min-w-0`}>
            {!hasVariants ? (
              <span className="text-gray-500">Price not available</span>
            ) : selectedVariant ? (
              <div className="flex items-center gap-1">
                {selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.price ? (
                  <>
                    <span className="line-through text-gray-400 text-xs">
                      {formatPrice(selectedVariant.originalPrice)}
                    </span>
                    <span className="text-green-600 font-bold">
                      {formatPrice(selectedVariant.price)}
                    </span>
                  </>
                ) : (
                  <span>{formatPrice(selectedVariant.price)}</span>
                )}
              </div>
            ) : minPrice === maxPrice ? (
              formatPrice(minPrice)
            ) : (
              `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
            )}
          </div>
          
          {/* Variant Dropdown */}
          {hasVariants && variants.length > 1 && (
            <div className="flex-shrink-0">
              <select
                value={selectedVariantId || ''}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className={`${compact ? 'text-xs px-1.5 py-1' : 'text-xs sm:text-sm px-2 py-1'} border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600`}
              >
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {formatUnit(variant.unit, variant.amount)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Cart Button Row - Always at bottom */}
      <div className={`${compact ? 'mt-2' : 'mt-2'} flex justify-center`}>
        {selectedVariant && (
          <AddToCartButton
            productId={product.id}
            variantId={selectedVariant.id}
            productName={product.name}
            variantUnit={selectedVariant.unit}
            variantAmount={selectedVariant.amount}
            price={selectedVariant.price}
            imageUrl={product.images[0]}
            className={`${compact ? 'h-7 sm:h-8 text-xs' : 'h-8 sm:h-9 text-xs sm:text-sm'} w-full`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l1.5 1.5m4.5-1.5h6" />
            </svg>
          </AddToCartButton>
        )}
        {!hasVariants && (
          <Link href={`/products/${product.slug}`} className="w-full">
            <Button className={`${compact ? 'h-7 sm:h-8 text-xs' : 'h-8 sm:h-9 text-xs sm:text-sm'} w-full`}>
              View Details
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
