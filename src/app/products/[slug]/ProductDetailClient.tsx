"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { useCartDrawer } from "@/components/cart/CartDrawerProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProductStructuredData from "@/components/ProductStructuredData";
import { toast } from "sonner";

interface ProductVariant {
  id: string;
  unit: string;
  amount: number;
  price: number;
  stock: number;
  sku: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  variants: ProductVariant[];
  category?: Category | null;
  meta?: any;
}

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { openCart } = useCartDrawer();

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price / 100);
  };

  const formatUnit = (unit: string, amount: number) => {
    const unitMap: { [key: string]: string } = {
      PIECE: "piece",
      KG: "kg",
      G: "g",
      LITER: "L",
      ML: "ml",
      CM: "cm",
      M: "m",
      INCH: "inch",
      OTHER: "unit"
    };
    return `${amount}${unitMap[unit] || unit.toLowerCase()}`;
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    setAddingToCart(true);
    try {
      await addToCart({
        productId: product.id,
        variantId: selectedVariant.id,
        productName: product.name,
        variantUnit: selectedVariant.unit,
        variantAmount: selectedVariant.amount,
        price: selectedVariant.price,
        quantity: quantity,
        imageUrl: product.images[0],
        maxStock: selectedVariant.stock
      });
      toast.success(`${product.name} added to cart!`);
      openCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The product you're looking for doesn't exist.
          </p>
          <Link href="/products">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProductStructuredData product={product} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {product.images && product.images.length > 0 ? (
            <>
              <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square relative overflow-hidden rounded-lg border-2 transition-colors ${
                        selectedImage === index
                          ? "border-blue-500"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-600 text-lg">
                No image available
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            {/* Category */}
            {product.category && (
              <div className="mb-3">
                <Link 
                  href={`/products?categoryId=${product.category.id}`}
                  className="inline-block"
                >
                  <span className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors text-sm font-medium">
                    {product.category.name}
                  </span>
                </Link>
              </div>
            )}
            
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            {product.description && (
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {product.description}
              </p>
            )}
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Available Sizes</h3>
              <div className="grid grid-cols-2 gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      selectedVariant?.id === variant.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">{formatUnit(variant.unit, variant.amount)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {formatPrice(variant.price)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price and Stock */}
          {selectedVariant && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-green-600">
                  {formatPrice(selectedVariant.price)}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  per {formatUnit(selectedVariant.unit, selectedVariant.amount)}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  selectedVariant.stock > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedVariant.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
                {selectedVariant.stock > 0 && (
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    ({selectedVariant.stock} available)
                  </span>
                )}
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock === 0 || addingToCart}
                className="w-full"
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
            </div>
          )}

          {/* Product Features */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Why Choose TaYaima?</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Fresh quality products delivered to your doorstep
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Fast delivery across India, including North East India
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Best prices guaranteed
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Easy returns and customer support
              </li>
            </ul>
          </Card>
        </div>
      </div>
      </div>
    </>
  );
}
