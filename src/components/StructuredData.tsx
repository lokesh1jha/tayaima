export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://tayaima.com",
    "name": "TaYaima",
    "alternateName": "TaYaima Grocery Store",
    "description": "India's trusted online grocery store. Fresh vegetables, fruits, dairy products, and daily essentials delivered across India including North East India. Best prices, quality guaranteed.",
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://tayaima.com",
    "logo": `${process.env.NEXT_PUBLIC_APP_URL || "https://tayaima.com"}/tayaima-logo.jpeg`,
    "image": `${process.env.NEXT_PUBLIC_APP_URL || "https://tayaima.com"}/tayaima-logo.jpeg`,
    "telephone": "+91-XXXXXXXXXX", // Add your phone number
    "email": "support@tayaima.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Your Street Address", // Add your address
      "addressLocality": "Guwahati",
      "addressRegion": "Assam",
      "postalCode": "781001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "26.1445", // Guwahati coordinates
      "longitude": "91.7362"
    },
    "openingHours": [
      "Mo-Su 06:00-23:00"
    ],
    "priceRange": "₹",
    "servesCuisine": "Grocery",
    "serviceArea": [
      {
        "@type": "State",
        "name": "Assam"
      },
      {
        "@type": "State", 
        "name": "Meghalaya"
      },
      {
        "@type": "State",
        "name": "Nagaland"
      },
      {
        "@type": "State",
        "name": "Manipur"
      },
      {
        "@type": "State",
        "name": "Mizoram"
      },
      {
        "@type": "State",
        "name": "Tripura"
      },
      {
        "@type": "State",
        "name": "Arunachal Pradesh"
      },
      {
        "@type": "State",
        "name": "Sikkim"
      },
      {
        "@type": "Country",
        "name": "India"
      }
    ],
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
