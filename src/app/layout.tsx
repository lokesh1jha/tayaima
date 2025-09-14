import "./globals.css";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { Toast } from "@/components/ui/toast";
import CartDrawer from "@/components/CartDrawer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kirana Store - Your Daily Needs Delivered",
  description: "Fresh groceries, household items, and daily essentials delivered to your doorstep. Shop online with ease and convenience.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Kirana Store - Your Daily Needs Delivered",
    description: "Fresh groceries, household items, and daily essentials delivered to your doorstep. Shop online with ease and convenience.",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    siteName: "Kirana Store",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Kirana Store" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kirana Store - Your Daily Needs Delivered",
    description: "Fresh groceries, household items, and daily essentials delivered to your doorstep. Shop online with ease and convenience.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
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