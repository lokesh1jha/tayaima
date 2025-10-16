import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProductCard from "@/components/ProductCard";
import CategoryChips from "@/components/CategoryChips";
import ProductsPrefetch from "@/components/ProductsPrefetch";
import BannerCarousel from "@/components/BannerCarousel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signUrlsInArray } from "@/lib/urlSigner";
import { cachedQuery } from "@/lib/cache";

// Enable ISR (Incremental Static Regeneration) for better performance
export const revalidate = 300; // Revalidate every 5 minutes

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  try {
    // Fetch all data in parallel with caching for better performance
    const [rawFeaturedProducts, categories] = await Promise.all([
      // Cached featured products (10 minute cache)
      cachedQuery(
        'homepage:featured-products',
        () => prisma.product.findMany({
          take: 5,
          include: { variants: true },
          orderBy: { createdAt: "desc" },
        }),
        600 // 10 minutes
      ),
      // Cached categories with parent-child relationships (30 minute cache)
      cachedQuery(
        'homepage:categories',
        () => prisma.category.findMany({
          orderBy: [
            { sortOrder: "asc" },
            { name: "asc" }
          ],
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            icon: true,
            parentId: true,
            sortOrder: true,
            parent: {
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true
              }
            },
            children: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                sortOrder: true,
                _count: {
                  select: { products: true }
                }
              },
              orderBy: { sortOrder: "asc" }
            },
            _count: {
              select: { products: true }
            }
          }
        }),
        1800 // 30 minutes
      )
    ]);

    // Sign URLs for featured products
    const featuredProducts = await signUrlsInArray(rawFeaturedProducts, ['images']);

    // Prepare category sections with cached products (limited for performance)
    // Only use parent categories (those without a parentId)
    const parentCategories = categories.filter(cat => !cat.parentId).slice(0, 3);
    
    const categorySections = await Promise.all(
      parentCategories.map(async (category) => {
        // Get child category IDs for this parent
        const childCategoryIds = category.children?.map(child => child.id) || [];
        
        // Cache products per category (15 minute cache)
        const rawProducts = await cachedQuery(
          `homepage:category-products:${category.id}`,
          () => prisma.product.findMany({
            where: {
              OR: [
                { categoryId: category.id }, // Products directly in parent
                { categoryId: { in: childCategoryIds } } // Products in child categories
              ]
            },
            include: { variants: true },
            take: 6, // Reduced from 10 to 6 for better performance
            orderBy: { createdAt: "desc" },
          }),
          900 // 15 minutes
        );
        
        // Sign URLs for category products
        const products = await signUrlsInArray(rawProducts, ['images']);
        return { category, products };
      })
    );

  return (
    <>
      {/* Hero / Top CTA */}
      <section 
        className="relative min-h-[500px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/tayaima-landing-page-bg_page.jpg')"
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Content */}
        <div className="relative z-10 container max-w-[1400px] py-12 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between gap-8">
            <div className="text-white">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 drop-shadow-lg">
                Fresh Groceries Delivered Fast Across India
              </h1>
              <p className="text-xl sm:text-2xl text-white mb-8 drop-shadow-md bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                KHURUMJARI Welcome to Tayaima Store, Your trusted family store from Manipur — now online.
              </p>
              <div className="flex gap-4">
                <Link href="/products">
                  <Button variant="primary" className="text-lg px-8 py-3">
                    Shop Now
                  </Button>
                </Link>
                {!session && (
                  <Link href="/signup">
                    <Button className="text-lg px-8 py-3 bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800">
                      Create Account
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Banner Carousel - Full Width */}
      <section className="w-full pt-4">
        <BannerCarousel />
      </section>

      {/* Category chips */}
      <CategoryChips categories={categories} />
      
      {/* Prefetch products for better performance */}
      <ProductsPrefetch categories={categories} />

      {/* Featured carousel */}
      <section className="container max-w-[1400px] py-6">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-xl font-semibold">Featured</h2>
          <Link href="/products" className="text-sm text-blue-600">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <div className="grid grid-flow-col auto-cols-[minmax(180px,1fr)] gap-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </div>
      </section>

      {/* Category rows */}
      {categorySections
        .filter(({ products }) => products.length > 0) // Only show categories with products
        .map(({ category, products }) => (
          <section key={category.id} className="container max-w-[1400px] py-6">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-xl font-semibold">Popular in {category.name}</h2>
              <Link href="/products" className="text-sm text-blue-600">See all</Link>
            </div>
            <div className="overflow-x-auto">
              <div className="grid grid-flow-col auto-cols-[minmax(180px,1fr)] gap-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} compact />
                ))}
              </div>
            </div>
          </section>
        ))}

      {/* About Section */}
      <section className="container max-w-[1400px] py-12 sm:py-16">
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Your Trusted Online Grocery Store</h2>
          <div className="space-y-4 text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              Tayaima Store was started by my grandfather, and we've been proudly serving customers offline in Manipur for over 50 years. Now, for the first time, we're launching our online store so everyone can shop easily from home. With just a click, you can order your daily needs and favorite Northeast items, and we'll deliver them straight to your doorstep — whether you live in Delhi, Bangalore, Mumbai, Hyderabad, or beyond.
            </p>
            <p>
              We aim to provide authentic Northeast products at reasonable prices and connect our customers to the taste and traditions of home. In the future, we also plan to expand our services abroad.
            </p>
            <p className="font-medium text-blue-600 dark:text-blue-400">
              We also accept function and bulk orders at special prices (T&C apply). For more details, contact us on WhatsApp for function or bulk order inquiries.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="container max-w-[1400px] py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Why Choose TaYaima?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Quick delivery across India, including North East India
            </p>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🌿</div>
            <h3 className="text-lg font-semibold mb-2">Fresh Products</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Quality guaranteed fresh groceries and daily essentials
            </p>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-lg font-semibold mb-2">Best Prices</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Competitive pricing on all products with great deals
            </p>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Safe and secure payment options for your convenience
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-12 sm:py-16">
        <div className="container max-w-[1400px]">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse & Select</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose from our wide range of fresh products and groceries
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Add to Cart</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Add items to your cart and proceed to secure checkout
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Delivered</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Receive your order fresh at your doorstep
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container max-w-[1400px] py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                AK
              </div>
              <div className="ml-3">
                <h4 className="font-semibold">Anita Khuraijam</h4>
                <div className="text-yellow-500 text-sm">★★★★★</div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              "Great service! Fresh vegetables delivered right to my door. The quality is excellent and prices are reasonable."
            </p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                TT
              </div>
              <div className="ml-3">
                <h4 className="font-semibold">Tony Thokchom</h4>
                <div className="text-yellow-500 text-sm">★★★★★</div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              "Love shopping from TaYaima! Fast delivery and the products are always fresh. Highly recommended!"
            </p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                AK
              </div>
              <div className="ml-3">
                <h4 className="font-semibold">Annie Kamei</h4>
                <div className="text-yellow-500 text-sm">★★★★★</div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              "Best online grocery store in North East India! Reliable service and quality products every time."
            </p>
          </Card>
        </div>
      </section>

    </>
  );
  
  } catch (error) {
    console.error('Error loading homepage data:', error);
    
    // Return a fallback page if data loading fails
    return (
      <div className="container max-w-[1400px] py-8">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Tayaima</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We're having trouble loading the latest products. Please try refreshing the page.
          </p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </Card>
      </div>
    );
  }
}