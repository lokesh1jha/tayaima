import "./globals.css";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MySaaS - Ship faster",
  description: "Next.js SaaS starter with auth, dashboard, and TailwindCSS.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "MySaaS - Ship faster",
    description: "Next.js SaaS starter with auth, dashboard, and TailwindCSS.",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    siteName: "MySaaS",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "MySaaS" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MySaaS - Ship faster",
    description: "Next.js SaaS starter with auth, dashboard, and TailwindCSS.",
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
        </Providers>
      </body>
    </html>
  );
}