"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useCart } from "@/context/CartContext";
import { LoadingPage } from "@/components/ui/LoadingSpinner";

interface ProductVariant {
  id: string;
  unit: string;
  amount: number;
  price: number;
  stock: number;
  sku?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  variants: ProductVariant[];
  createdAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem, openCart } = useCart();

  useEffect(() => {
    if (params.slug) {
      fetchProduct(params.slug as string);
    }
  }, [params.slug]);

  useEffect(() => {
    if (product && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  const fetchProduct = async (slug: string) => {
    try {
      const response = await fetch(`/api/products?slug=${slug}`);
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        setProduct(data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

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
      OTHER: "unit"
    };
    return `${amount}${unitMap[unit] || unit.toLowerCase()}`;
  };

  const addToCart = async () => {
    if (!selectedVariant) return;
    setAddingToCart(true);
    try {
      await addItem(selectedVariant.id, quantity);
      openCart();
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <LoadingPage message="Loading product details..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {product.images.length > 0 ? (
              product.images[selectedImage].includes('.s3.') || product.images[selectedImage].includes('amazonaws.com') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              )
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No Image Available
              </div>
            )}
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square relative rounded overflow-hidden border-2 ${
                    selectedImage === index ? "border-blue-500" : "border-gray-200"
                  }`}
                >
                  {image.includes('.s3.') || image.includes('amazonaws.com') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            {product.description && (
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {product.description}
              </p>
            )}
          </div>

          {/* Variants */}
          {product.variants.length > 1 && (
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
                      {formatPrice(variant.price)} • {variant.stock} in stock
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
                <span className="text-sm text-gray-500">
                  {selectedVariant.stock} in stock
                </span>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="quantity" className="text-sm font-medium">
                    Quantity:
                  </label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedVariant.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20"
                  />
                </div>
                <Button
                  onClick={addToCart}
                  disabled={addingToCart || selectedVariant.stock === 0}
                  className="flex-1"
                >
                  {addingToCart ? "Adding..." : selectedVariant.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
              </div>
            </div>
          )}

          {/* Product Info */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Product Information</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div>SKU: {selectedVariant?.sku || "N/A"}</div>
              <div>Available variants: {product.variants.length}</div>
              <div>Total stock: {product.variants.reduce((sum, v) => sum + v.stock, 0)}</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
