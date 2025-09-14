"use client";

import Link from "next/link";
import Image from "next/image";
import Card from "./ui/Card";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";

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
  
  const minPrice = Math.min(...product.variants.map(v => v.price));
  const maxPrice = Math.max(...product.variants.map(v => v.price));
  const formatPrice = (price: number) => `₹${(price / 100).toFixed(2)}`;

  // If you want to require login before viewing details, uncomment below
  // const handleClick = (e: React.MouseEvent) => {
  //   if (!session) {
  //     e.preventDefault();
  //     toast.info("Please sign in to view product details");
  //     signIn();
  //   }
  // };

  return (
    <Link href={`/products/${product.slug}`}
      // onClick={handleClick}
    >
      <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-square relative mb-4">
          <Image
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-lg font-bold">
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
