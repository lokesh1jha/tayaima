"use client";

import Link from "next/link";
import Image from "next/image";
import Card from "./ui/Card";
import { useSession } from "next-auth/react";

interface ProductVariant {
  id: string;
  unit: string;
  amount: number;
  price: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  variants: ProductVariant[];
}

export default function ProductCard({ product }: { product: Product }) {
  const { data: session } = useSession();
  const imageUrl = product.images[0] || '/placeholder-product.jpg';
  
  const minPrice = Math.min(...product.variants.map(v => v.price));
  const maxPrice = Math.max(...product.variants.map(v => v.price));
  const formatPrice = (price: number) => `₹${(price / 100).toFixed(2)}`;

  return (
    <Link href={`/products/${product.slug}`}
      // onClick={handleClick}
    >
      <Card className="p-2 sm:p-3 md:p-4 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-square relative mb-2 sm:mb-3 md:mb-4">
          {imageUrl.includes('.s3.') || imageUrl.includes('amazonaws.com') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={`${product.name} - Fresh ${product.name.toLowerCase()} available for delivery from TaYaima grocery store`}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
            />
          ) : (
            <Image
              src={imageUrl}
              alt={`${product.name} - Fresh ${product.name.toLowerCase()} available for delivery from TaYaima grocery store`}
              fill
              className="object-cover rounded-lg"
              loading="lazy"
            />
          )}
        </div>
        <h3 className="font-semibold text-xs sm:text-sm md:text-lg line-clamp-2">{product.name}</h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 hidden sm:block">
          {product.description}
        </p>
        <div className="mt-2 sm:mt-3 flex items-center justify-between">
          <div className="text-sm sm:text-base md:text-lg font-bold">
            {minPrice === maxPrice 
              ? formatPrice(minPrice)
              : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
            }
          </div>
        </div>
      </Card>
    </Link>
  );
}
