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
  const imageUrl = product.images[0] || '/placeholder-product.jpg';

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants[0]?.id || null
  );

  const selectedVariant = useMemo(() => {
    return product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
  }, [product.variants, selectedVariantId]);

  const minPrice = Math.min(...product.variants.map(v => v.price));
  const maxPrice = Math.max(...product.variants.map(v => v.price));

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price / 100);

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
    <Card className="p-2 sm:p-3 md:p-4 hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.slug}`} className="block">
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
      </Link>

      {/* Variant selector */}
      {product.variants.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {product.variants.map((variant) => (
            <button
              key={variant.id}
              onClick={(e) => {
                e.preventDefault();
                setSelectedVariantId(variant.id);
              }}
              className={`px-2 py-1 rounded-md border text-xs sm:text-sm transition-colors ${
                selectedVariant?.id === variant.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {formatUnit(variant.unit, variant.amount)}
            </button>
          ))}
        </div>
      )}

      <div className="mt-2 sm:mt-3 flex items-center justify-between">
        <div className="text-sm sm:text-base md:text-lg font-bold text-green-600">
          {selectedVariant
            ? formatPrice(selectedVariant.price)
            : minPrice === maxPrice
              ? formatPrice(minPrice)
              : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
        </div>
        {selectedVariant && (
          <AddToCartButton
            productId={product.id}
            variantId={selectedVariant.id}
            productName={product.name}
            variantUnit={selectedVariant.unit}
            variantAmount={selectedVariant.amount}
            price={selectedVariant.price}
            imageUrl={product.images[0]}
            className="h-8 sm:h-9 text-xs sm:text-sm"
          >
            Add
          </AddToCartButton>
        )}
      </div>
    </Card>
  );
}
