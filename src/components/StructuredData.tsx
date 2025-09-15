export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://tayaima.com",
    "name": "TaYaima",
    "alternateName": "TaYaima Grocery Store",
    "description": "Your neighborhood's trusted grocery store. Fresh vegetables, daily essentials, and quality products delivered to your doorstep with care.",
    "url": "https://tayaima.com",
    "logo": "https://tayaima.com/logo.png",
    "image": "https://tayaima.com/og.png",
    "telephone": "+91-XXXXXXXXXX", // Add your phone number
    "email": "support@tayaima.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Your Street Address", // Add your address
      "addressLocality": "Your City",
      "addressRegion": "Your State",
      "postalCode": "Your PIN",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "0.0000", // Add your coordinates
      "longitude": "0.0000"
    },
    "openingHours": [
      "Mo-Su 06:00-23:00"
    ],
    "priceRange": "₹",
    "servesCuisine": "Grocery",
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "0.0000",
        "longitude": "0.0000"
      },
      "geoRadius": "10000" // 10km radius
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "TaYaima Products",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Fresh Vegetables"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Product",
            "name": "Fresh Fruits"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product", 
            "name": "Dairy Products"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Household Items"
          }
        }
      ]
    },
    "potentialAction": {
      "@type": "OrderAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://tayaima.com/products",
        "inLanguage": "en-IN",
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      },
      "deliveryMethod": "http://purl.org/goodrelations/v1#DeliveryModeDirectDownload"
    },
    "sameAs": [
      // Add your social media links
      "https://facebook.com/tayaima",
      "https://instagram.com/tayaima", 
      "https://twitter.com/tayaima"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
