"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Sidebar, SidebarBody } from "@/components/ui/sidebar";
import { useCart } from "@/hooks/useCart";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import LoadingSpinner, { LoadingPage, LoadingSection } from "@/components/ui/LoadingSpinner";

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
  categoryId?: string | null;
}

interface Category { id: string; name: string; slug: string }

export default function ProductsPage() {
  const { data: session } = useSession();
  const { items: cartItems, addToCart, updateCartItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // reset when category changes
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  }, [selectedCategory]);

  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesText = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesText;
    });
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      const list: Category[] = data.categories || [];
      setCategories(list);
      if (list.length > 0) setSelectedCategory(list[0].id);
    } catch {
      setCategories([]);
    }
  };

  const fetchProducts = async (nextPage = page, replace = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("limit", "20");
      params.set("page", String(nextPage));
      if (selectedCategory) params.set("categoryId", selectedCategory);
      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      const list: Product[] = data.data || [];
      setProducts((prev) => (replace ? list : [...prev, ...list]));
      setHasMore(list.length === 20);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // infinite scroll
  useEffect(() => {
    function onScroll() {
      if (loadingMore || !hasMore) return;
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
      if (nearBottom) {
        setLoadingMore(true);
        const next = page + 1;
        fetchProducts(next).then(() => {
          setPage(next);
          setLoadingMore(false);
        });
      }
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [page, hasMore, loadingMore, selectedCategory]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price / 100);
  };

  const getTotalStock = (variants: ProductVariant[]) => {
    return variants.reduce((sum, v) => sum + v.stock, 0);
  };

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-0">
        {/* Left: Category Sidebar - Desktop */}
        <div className="hidden md:block">
          <Sidebar animate={false} open={true}>
            <SidebarBody className="h-full !px-0 !py-0">
              <div className="h-full w-full bg-neutral-100 dark:bg-neutral-800 p-4 border-r border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Categories</h3>
                <div className="flex flex-col gap-1">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`text-left px-3 py-2 rounded-md text-sm transition ${selectedCategory === c.id ? "bg-white dark:bg-neutral-700 shadow" : "hover:bg-white/60 dark:hover:bg-neutral-700/60"}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </SidebarBody>
          </Sidebar>
        </div>

        {/* Right: Products */}
        <div className="md:pl-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4">Our Products</h1>
            
            {/* Mobile Category Selector */}
            <div className="md:hidden mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Categories</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedCategory === c.id 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-w-md">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <LoadingPage message="Loading products..." />
          ) : filteredProducts.length === 0 ? (
            <Card className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {searchTerm ? "Try adjusting your search terms" : "No products available for this category"}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {filteredProducts.map((product) => {
                const defaultVariant = product.variants[0];
                const cartItem = cartItems.find(i => i.variantId === defaultVariant?.id);
                const qty = cartItem?.quantity || 0;

                const handleAdd = async (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!defaultVariant) return;
                  if (!session) {
                    toast.info("Please sign in to add items to cart");
                    signIn();
                    return;
                  }
                  addToCart({
                    productId: product.id,
                    variantId: defaultVariant.id,
                    productName: product.name,
                    variantUnit: defaultVariant.unit,
                    variantAmount: defaultVariant.amount,
                    price: defaultVariant.price,
                    quantity: 1,
                    maxStock: defaultVariant.stock,
                    imageUrl: product.images[0],
                  });
                };

                const handleUpdate = async (e: React.MouseEvent, next: number) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!defaultVariant) return;
                  if (!session) {
                    toast.info("Please sign in to modify cart");
                    signIn();
                    return;
                  }
                  if (!cartItem && next > 0) {
                    addToCart({
                      productId: product.id,
                      variantId: defaultVariant.id,
                      productName: product.name,
                      variantUnit: defaultVariant.unit,
                      variantAmount: defaultVariant.amount,
                      price: defaultVariant.price,
                      quantity: next,
                      maxStock: defaultVariant.stock,
                      imageUrl: product.images[0],
                    });
                  } else if (cartItem) {
                    updateCartItem({ itemId: cartItem.id, quantity: Math.max(0, next) });
                  }
                };

                return (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                    <Link href={`/products/${product.slug}`}>
                      <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
                        {product.images.length > 0 ? (
                          product.images[0].includes('.s3.') || product.images[0].includes('amazonaws.com') ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          )
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="p-2 sm:p-3 md:p-4 flex flex-col flex-grow">
                        <h3 className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg mb-1 sm:mb-2 line-clamp-2">{product.name}</h3>
                        {product.description && (
                          <p className="hidden sm:block text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 flex-grow">
                            {product.description}
                          </p>
                        )}
                        <div className="mt-auto space-y-2 sm:space-y-3">
                          <div className="text-center">
                            <span className="text-sm sm:text-lg md:text-xl font-bold text-green-600">
                            {formatPrice(Math.min(...product.variants.map(v => v.price)))}
                            </span>
                          </div>
                          {/* Cart Controls - Full Width */}
                          {qty === 0 ? (
                            <Button
                              variant="secondary"
                              className="w-full h-8 sm:h-9 md:h-10 text-xs sm:text-sm font-medium"
                              onClick={handleAdd}
                            >
                              Add to Cart
                            </Button>
                          ) : (
                            <div className="flex items-center justify-center gap-2 sm:gap-3">
                              <Button 
                                className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex-shrink-0" 
                                variant="ghost" 
                                onClick={(e) => handleUpdate(e, qty - 1)}
                              >
                                -
                              </Button>
                              <span className="min-w-[2rem] sm:min-w-[2.5rem] md:min-w-[3rem] text-center text-sm sm:text-base font-medium bg-gray-100 dark:bg-gray-800 rounded px-2 sm:px-3 py-1 sm:py-2">
                                {qty}
                              </span>
                              <Button 
                                className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex-shrink-0" 
                                variant="ghost" 
                                onClick={(e) => handleUpdate(e, qty + 1)}
                              >
                                +
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </Card>
                );
              })}
            </div>
          )}
          {loadingMore && (
            <div className="flex justify-center py-6">
              <LoadingSpinner />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
