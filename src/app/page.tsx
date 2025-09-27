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

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  // Fetch featured products (limited to 5 for better performance)
  const rawFeaturedProducts = await prisma.product.findMany({
    take: 5,
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  // Sign URLs for featured products
  const featuredProducts = await signUrlsInArray(rawFeaturedProducts, ['images']);

  // Fetch categories for chips and sections
  const categories = await prisma.category.findMany({
    take: 10,
    orderBy: { name: "asc" },
  });

  // Prepare a few category sections with products (limited for performance)
  const categorySections = await Promise.all(
    categories.slice(0, 3).map(async (category) => {
      const rawProducts = await prisma.product.findMany({
        where: { categoryId: category.id },
        include: { variants: true },
        take: 6, // Reduced from 10 to 6 for better performance
        orderBy: { createdAt: "desc" },
      });
      
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
}