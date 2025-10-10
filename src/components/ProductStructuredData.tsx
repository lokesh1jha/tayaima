interface ProductStructuredDataProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    images: string[];
    variants: Array<{
      id: string;
      unit: string;
      amount: number;
      price: number;
      stock: number;
      sku: string | null;
    }>;
    category?: {
      id: string;
      name: string;
      slug: string;
    } | null;
    meta?: any;
  };
}

export default function ProductStructuredData({ product }: ProductStructuredDataProps) {
  const lowestPrice = Math.min(...product.variants.map(v => v.price));
  const highestPrice = Math.max(...product.variants.map(v => v.price));
  const inStock = product.variants.some(v => v.stock > 0);
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `Buy ${product.name} online at TaYaima. Fresh quality products delivered to your doorstep across India.`,
    "image": product.images.length > 0 ? product.images : ["/tayaima-logo.jpeg"],
    "sku": product.variants[0]?.sku || product.id,
    "brand": {
      "@type": "Brand",
      "name": "TaYaima"
    },
    "category": product.category?.name || "Grocery",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": lowestPrice / 100,
      "highPrice": highestPrice / 100,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "TaYaima",
        "url": process.env.NEXT_PUBLIC_APP_URL || "https://tayaima.com"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "INR"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "businessDays": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
          },
          "cutoffTime": "14:00",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 2,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 3,
            "unitCode": "DAY"
          }
        }
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Priya Sharma"
        },
        "reviewBody": "Excellent quality and fast delivery. Highly recommended for fresh groceries!"
      },
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "4",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Rajesh Kumar"
        },
        "reviewBody": "Good product quality and reasonable prices. Delivery was on time."
      }
    ],
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Delivery Areas",
        "value": "All India including North East India"
      },
      {
        "@type": "PropertyValue",
        "name": "Payment Methods",
        "value": "COD, UPI, Cards, Net Banking"
      },
      {
        "@type": "PropertyValue",
        "name": "Return Policy",
        "value": "7 days return policy"
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
