import "./globals.css";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { Toast } from "@/components/ui/toast";
import CartDrawer from "@/components/CartDrawer";
import StructuredData from "@/components/StructuredData";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaYaima - Your Daily Needs Delivered",
  description: "Fresh groceries, household items, and daily essentials delivered to your doorstep. Shop online with ease and convenience.",
  keywords: "grocery delivery, fresh vegetables, online grocery store, daily essentials, home delivery, TaYaima",
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
    title: "TaYaima - Your Daily Needs Delivered",
    description: "Fresh groceries, household items, and daily essentials delivered to your doorstep. Shop online with ease and convenience.",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    siteName: "TaYaima",
    images: [{ url: "/icon-512x512.svg", width: 512, height: 512, alt: "TaYaima - Fresh Grocery Delivery Service" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaYaima - Your Daily Needs Delivered",
    description: "Fresh groceries, household items, and daily essentials delivered to your doorstep. Shop online with ease and convenience.",
    images: ["/icon-512x512.svg"],
    creator: "@tayaima",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CartDrawer />
          <Toast />
        </Providers>
      </body>
    </html>
  );
}