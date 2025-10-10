import { Metadata } from 'next';
import ProductsPageClient from './ProductsPageClient';

export const metadata: Metadata = {
  title: 'Fresh Groceries & Daily Essentials Online | Buy Vegetables, Fruits, Dairy Products | TaYaima',
  description: 'Shop fresh vegetables, fruits, dairy products, and daily essentials online at TaYaima. Fast delivery across India including North East India. Best prices, quality guaranteed. Order now!',
  keywords: 'online grocery store, fresh vegetables, fruits, dairy products, daily essentials, home delivery, India delivery, North East India, TaYaima, grocery delivery, fresh produce, online shopping, best prices',
  authors: [{ name: 'TaYaima' }],
  creator: 'TaYaima',
  publisher: 'TaYaima',
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
  openGraph: {
    title: 'Fresh Groceries & Daily Essentials Online | TaYaima',
    description: 'Shop fresh vegetables, fruits, dairy products, and daily essentials online at TaYaima. Fast delivery across India including North East India. Best prices, quality guaranteed.',
    url: `${process.env.NEXT_PUBLIC_APP_URL}/products`,
    siteName: 'TaYaima',
    images: [
      {
        url: '/tayaima-logo.jpeg',
        width: 1200,
        height: 630,
        alt: 'TaYaima - Fresh Grocery Delivery Service'
      }
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fresh Groceries & Daily Essentials Online | TaYaima',
    description: 'Shop fresh vegetables, fruits, dairy products, and daily essentials online at TaYaima. Fast delivery across India including North East India.',
    images: ['/tayaima-logo.jpeg'],
    creator: '@tayaima',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/products`,
  },
};

export default function ProductsPage() {
  return <ProductsPageClient />;
}