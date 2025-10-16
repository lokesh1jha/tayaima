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
        className="relative min-h-[600px] flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{
          backgroundImage: "url('/tayaima-landing-page-bg_page.jpg')"
        }}
      >
        {/* Enhanced Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        
        {/* Content */}
        <div className="relative z-10 container max-w-[1400px] py-16 px-4">
          <div className="max-w-4xl">
            <div className="space-y-6 animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-white text-sm font-medium">🌿 Fresh • Authentic • Trusted</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-2xl leading-tight">
                Fresh Groceries <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Delivered Fast
                </span>
                <br className="hidden sm:block" /> Across India
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-white/95 max-w-2xl leading-relaxed backdrop-blur-sm bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="font-semibold text-green-300">KHURUMJARI</span> Welcome to Tayaima Store — Your trusted family store from Manipur, now online.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/products">
                  <Button className="text-lg px-10 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-xl shadow-green-500/30 border-0 transition-all hover:scale-105 hover:shadow-2xl">
                    🛒 Shop Now
                  </Button>
                </Link>
                {!session && (
                  <Link href="/signup">
                    <Button className="text-lg px-10 py-4 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all hover:scale-105">
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
      <section className="container max-w-[1400px] py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Why Choose TaYaima?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Experience the perfect blend of tradition and modern convenience
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800">
            <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🚚</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Fast Delivery</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Quick delivery across India, including North East India
            </p>
          </Card>
          <Card className="group p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 border-2 border-transparent hover:border-green-200 dark:hover:border-green-800">
            <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🌿</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Fresh Products</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Quality guaranteed fresh groceries and daily essentials
            </p>
          </Card>
          <Card className="group p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800 border-2 border-transparent hover:border-amber-200 dark:hover:border-amber-800">
            <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">💰</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Best Prices</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Competitive pricing on all products with great deals
            </p>
          </Card>
          <Card className="group p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800">
            <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🔒</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Secure Payment</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Safe and secure payment options for your convenience
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-green-900/10 py-16 sm:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
        </div>
        
        <div className="container max-w-[1400px] relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-1 bg-gradient-to-r from-blue-200 via-green-200 to-purple-200 dark:from-blue-800 dark:via-green-800 dark:to-purple-800"></div>
            
            <div className="relative">
              <div className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto shadow-lg shadow-blue-500/30 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    1
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-white">Browse & Select</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Choose from our wide range of fresh products and authentic Northeast groceries
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto shadow-lg shadow-green-500/30 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    2
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-white">Add to Cart</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Add items to your cart and proceed to our secure checkout
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto shadow-lg shadow-purple-500/30 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    3
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-white">Get Delivered</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Receive your order fresh and fast at your doorstep
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container max-w-[1400px] py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Trusted by families across India
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="relative p-8 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/20 border-2 border-blue-100 dark:border-blue-900/50 overflow-hidden group">
            <div className="absolute top-0 right-0 text-8xl text-blue-100 dark:text-blue-900/30 transform rotate-180 -mr-4 -mt-4">"</div>
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  AK
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">Anita Khuraijam</h4>
                  <div className="text-yellow-500 text-lg">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                "Great service! Fresh vegetables delivered right to my door. The quality is excellent and prices are reasonable."
              </p>
            </div>
          </Card>
          
          <Card className="relative p-8 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-green-50/50 dark:from-gray-800 dark:to-green-900/20 border-2 border-green-100 dark:border-green-900/50 overflow-hidden group">
            <div className="absolute top-0 right-0 text-8xl text-green-100 dark:text-green-900/30 transform rotate-180 -mr-4 -mt-4">"</div>
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  TT
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">Tony Thokchom</h4>
                  <div className="text-yellow-500 text-lg">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                "Love shopping from TaYaima! Fast delivery and the products are always fresh. Highly recommended!"
              </p>
            </div>
          </Card>
          
          <Card className="relative p-8 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/20 border-2 border-purple-100 dark:border-purple-900/50 overflow-hidden group">
            <div className="absolute top-0 right-0 text-8xl text-purple-100 dark:text-purple-900/30 transform rotate-180 -mr-4 -mt-4">"</div>
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  AK
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">Annie Kamei</h4>
                  <div className="text-yellow-500 text-lg">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                "Best online grocery store in North East India! Reliable service and quality products every time."
              </p>
            </div>
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