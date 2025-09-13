import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="container py-20 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
          Build your SaaS faster with MySaaS
        </h1>
        <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Next.js 14 App Router, TypeScript, Tailwind, NextAuth, and Prisma. Everything you need to start shipping.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/signup"><Button>Get started</Button></Link>
          <Link href="/dashboard"><Button variant="secondary">Live demo</Button></Link>
        </div>
      </section>

      {/* Features */}
      <section className="container grid sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
        {[
          { title: "Authentication", desc: "Email/password and Google login via NextAuth." },
          { title: "Database", desc: "Prisma ORM with PostgreSQL and ready-to-use User model." },
          { title: "UI Kit", desc: "Reusable Button, Input and Card components with dark mode." },
          { title: "API routes", desc: "Boilerplate endpoints to extend for your app logic." },
          { title: "Best practices", desc: "SEO metadata, environment setup, and sensible defaults." },
          { title: "Dashboard", desc: "Protected pages and widgets to kickstart your product." },
        ].map((f) => (
          <Card key={f.title} className="p-6">
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{f.desc}</p>
          </Card>
        ))}
      </section>

      {/* Pricing */}
      <section id="pricing" className="container py-16">
        <h2 className="text-3xl font-bold text-center">Simple pricing</h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mt-2">Start for free, upgrade when you grow.</p>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {[
            { name: "Hobby", price: "$0", features: ["1 project", "Community support", "Basic analytics"], cta: "Start free" },
            { name: "Pro", price: "$19", features: ["Unlimited projects", "Priority support", "Advanced analytics"], cta: "Upgrade" },
            { name: "Team", price: "$49", features: ["Seat-based pricing", "SSO (soon)", "Role-based access"], cta: "Contact sales" },
          ].map((tier) => (
            <Card key={tier.name} className="p-6">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-semibold">{tier.name}</h3>
                <span className="text-2xl font-bold">{tier.price}</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {tier.features.map((ft) => (
                  <li key={ft} className="flex items-center gap-2">
                    <span className="text-brand-600">✓</span> {ft}
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
          <h3 className="text-2xl font-semibold">Ready to launch your SaaS?</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Create an account and start building. Add payments and subscriptions next.
          </p>
          <div className="mt-6">
            <Link href="/signup"><Button>Create account</Button></Link>
          </div>
        </Card>
      </section>
    </>
  );
}