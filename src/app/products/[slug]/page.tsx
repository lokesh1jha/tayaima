import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { signUrlsInObject } from '@/lib/urlSigner';
import ProductDetailClient from './ProductDetailClient';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: {
          select: {
            price: true,
            unit: true,
            amount: true,
            stock: true
          }
        }
      }
    });

    if (!product) {
      return {
        title: 'Product Not Found - TaYaima',
        description: 'The requested product could not be found.'
      };
    }

    const lowestPrice = Math.min(...product.variants.map(v => v.price));
    const highestPrice = Math.max(...product.variants.map(v => v.price));
    const priceRange = lowestPrice === highestPrice 
      ? `₹${(lowestPrice / 100).toFixed(0)}`
      : `₹${(lowestPrice / 100).toFixed(0)} - ₹${(highestPrice / 100).toFixed(0)}`;

    const title = `${product.name} - Buy Online at Best Price ${priceRange} | TaYaima`;
    const description = `${product.description || `Buy ${product.name} online at TaYaima. Fresh quality products delivered to your doorstep across India. Best prices, fast delivery.`} Available in ${product.variants.length} sizes. Order now!`;

    const keywords = [
      product.name,
      product.name.toLowerCase(),
      `${product.name} online`,
      `${product.name} price`,
      `${product.name} buy online`,
      `${product.name} delivery`,
      product.category?.name || '',
      'online grocery',
      'fresh vegetables',
      'home delivery',
      'India delivery',
      'North East India',
      'TaYaima',
      'grocery delivery India'
    ].filter(Boolean).join(', ');

    return {
      title,
      description,
      keywords,
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
        title,
        description,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
        siteName: 'TaYaima',
        images: product.images.length > 0 ? [
          {
            url: product.images[0],
            width: 1200,
            height: 630,
            alt: `${product.name} - TaYaima`
          }
        ] : [
          {
            url: '/tayaima-logo.jpeg',
            width: 1200,
            height: 630,
            alt: `${product.name} - TaYaima`
          }
        ],
        locale: 'en_IN',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: product.images.length > 0 ? [product.images[0]] : ['/tayaima-logo.jpeg'],
        creator: '@tayaima',
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for product:', error);
    return {
      title: 'Product - TaYaima',
      description: 'Buy fresh products online at TaYaima'
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true
      }
    });

    if (!product) {
      notFound();
    }

    // Sign image URLs before passing to client
    const signedProduct = await signUrlsInObject(product, ['images']);

    return <ProductDetailClient product={signedProduct} />;
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }
}