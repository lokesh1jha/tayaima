import "./globals.css";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { Toast } from "@/components/ui/toast";
import { CartDrawerWrapper } from "@/components/cart/CartDrawerWrapper";
import StructuredData from "@/components/StructuredData";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaYaima - Fresh Groceries Delivered Across India | Online Grocery Store",
  description: "Shop fresh groceries online at TaYaima. Fast delivery across India including North East. Fresh vegetables, fruits, dairy & daily essentials. Best prices guaranteed!",
  keywords: "online grocery store India, fresh vegetables online, fruits delivery, dairy products, daily essentials, home delivery India, North East India grocery, TaYaima, grocery delivery India, fresh produce online, online shopping India, best grocery prices, fast delivery India, Assam grocery delivery, Meghalaya online shopping, Nagaland grocery store, Manipur fresh vegetables, Mizoram dairy products, Tripura fruits delivery, Arunachal Pradesh grocery, Sikkim online store",
  authors: [{ name: "TaYaima" }],
  creator: "TaYaima",
  publisher: "TaYaima",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  },
  openGraph: {
    title: "TaYaima - Fresh Groceries & Daily Essentials Delivered Across India",
    description: "Shop fresh vegetables, fruits, dairy products, and daily essentials online at TaYaima. Fast delivery across India including North East India. Best prices, quality guaranteed.",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    siteName: "TaYaima",
    images: [{ url: "/tayaima-logo.jpeg", width: 1200, height: 630, alt: "TaYaima - Fresh Grocery Delivery Service Across India" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaYaima - Fresh Groceries Delivered Across India",
    description: "Shop fresh vegetables, fruits, dairy products, and daily essentials online at TaYaima. Fast delivery across India including North East India.",
    images: ["/tayaima-logo.jpeg"],
    creator: "@tayaima",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.svg" />
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CartDrawerWrapper />
          <Toast />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}