import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProductCard from "@/components/ProductCard";
import CategoryChips from "@/components/CategoryChips";
import ProductsPrefetch from "@/components/ProductsPrefetch";
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
      // Cached categories (30 minute cache)
      cachedQuery(
        'homepage:categories',
        () => prisma.category.findMany({
          take: 10,
          orderBy: { name: "asc" },
        }),
        1800 // 30 minutes
      )
    ]);

    // Sign URLs for featured products
    const featuredProducts = await signUrlsInArray(rawFeaturedProducts, ['images']);

    // Prepare category sections with cached products (limited for performance)
    const categorySections = await Promise.all(
      categories.slice(0, 3).map(async (category) => {
        // Cache products per category (15 minute cache)
        const rawProducts = await cachedQuery(
          `homepage:category-products:${category.id}`,
          () => prisma.product.findMany({
            where: { categoryId: category.id },
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
      <section className="container max-w-[1400px] py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Groceries delivered fast</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Fresh veggies, daily essentials, and more.</p>
            <div className="mt-4 flex gap-3">
              <Link href="/products"><Button variant="primary">Shop Now</Button></Link>
              {!session && <Link href="/signup"><Button variant="secondary">Create Account</Button></Link>}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <div className="px-3 py-2 rounded-md bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">Fast delivery</div>
            <div className="px-3 py-2 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">Quality assured</div>
          </div>
        </div>
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
      {categorySections.map(({ category, products }) => (
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

      {/* Compact CTA */}
      <section className="container max-w-[1400px] py-12 text-center">
        <Card className="p-8">
          <h3 className="text-2xl font-semibold">Ready to start shopping?</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Browse our wide selection and get everything you need delivered.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link href="/products"><Button>Start Shopping</Button></Link>
            {!session && <Link href="/signup"><Button variant="secondary">Create Account</Button></Link>}
          </div>
        </Card>
      </section>

      {/* CTA */}
      <section className="container py-20 text-center">
        <Card className="p-10">
          <h3 className="text-2xl font-semibold">Ready to start shopping?</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Browse our wide selection of products and get everything you need delivered to your doorstep.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link href="/products"><Button>Start Shopping</Button></Link>
            <Link href="/signup"><Button variant="secondary">Create Account</Button></Link>
          </div>
        </Card>
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