import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProductCard from "@/components/ProductCard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  // Fetch featured products
  const featuredProducts = await prisma.product.findMany({
    take: 8,
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      {/* Hero */}
      <section className="container py-20 text-center">
        <div className="flex justify-center mb-6">
          <span className="text-8xl">🏪</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight" style={{ color: 'var(--color-primary)' }}>
          Welcome to Kirana Store
        </h1>
        <p className="mt-6 text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          Your neighborhood's trusted grocery store. Fresh vegetables, daily essentials, and quality products delivered to your doorstep with care.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/products"><Button variant="primary">🛒 Shop Now</Button></Link>
          {!session && <Link href="/signup"><Button variant="secondary">✨ Create Account</Button></Link>}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center">Featured Products</h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mt-2">Fresh products delivered to your doorstep</p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/products">
            <Button>View All Products</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container grid sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
        {[
          { title: "Fresh Products", desc: "High-quality groceries and household items sourced fresh daily." },
          { title: "Fast Delivery", desc: "Quick and reliable delivery to your doorstep within hours." },
          { title: "Easy Ordering", desc: "Simple and intuitive shopping experience with secure checkout." },
          { title: "Multiple Payment", desc: "Pay with COD, PhonePe, or other convenient payment methods." },
          { title: "Order Tracking", desc: "Track your orders in real-time from placement to delivery." },
          { title: "Customer Support", desc: "24/7 customer support to help with any questions or issues." },
        ].map((f) => (
          <Card key={f.title} className="p-6">
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{f.desc}</p>
          </Card>
        ))}
      </section>

      {/* Categories */}
      <section id="categories" className="container py-16">
        <h2 className="text-3xl font-bold text-center">Shop by Category</h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mt-2">Find everything you need in one place.</p>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {[
            { name: "Groceries", price: "Fresh & Organic", features: ["Vegetables", "Fruits", "Dairy Products", "Grains & Pulses"], cta: "Shop Groceries" },
            { name: "Household", price: "Daily Essentials", features: ["Cleaning Supplies", "Personal Care", "Kitchen Items", "Home Decor"], cta: "Shop Household" },
            { name: "Snacks", price: "Quick Bites", features: ["Biscuits & Cookies", "Chips & Nuts", "Beverages", "Ready to Eat"], cta: "Shop Snacks" },
          ].map((tier) => (
            <Card key={tier.name} className="p-6">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-semibold">{tier.name}</h3>
                <span className="text-sm text-gray-600 dark:text-gray-300">{tier.price}</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {tier.features.map((ft) => (
                  <li key={ft} className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> {ft}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full">{tier.cta}</Button>
            </Card>
          ))}
        </div>
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