export default function StructuredData() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://tayaima.com/#organization",
    "name": "TaYaima",
    "alternateName": "TaYaima Grocery Store",
    "description": "India's trusted online grocery store. Fresh vegetables, fruits, dairy products, and daily essentials delivered across India including North East India. Best prices, quality guaranteed.",
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://tayaima.com",
    "logo": `${process.env.NEXT_PUBLIC_APP_URL || "https://tayaima.com"}/tayaima-logo.jpeg`,
    "image": `${process.env.NEXT_PUBLIC_APP_URL || "https://tayaima.com"}/tayaima-logo.jpeg`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-8837284911",
      "contactType": "customer service",
      "email": "tayaima.com@gmail.com",
      "availableLanguage": "English"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Thangmeiband Polem Leikai",
      "addressLocality": "Imphal",
      "addressRegion": "Manipur",
      "postalCode": "795001",
      "addressCountry": "IN"
    },
    "sameAs": [
      "https://www.facebook.com/people/TaYaima-store/61581025515343/",
      "https://www.instagram.com/tayaima_store/",
      "https://tayaima.com"
    ]
  };

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
    "telephone": "+91-8837284911",
    "email": "tayaima.com@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Thangmeiband Polem Leikai",
      "addressLocality": "Imphal",
      "addressRegion": "Manipur",
      "postalCode": "795001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "24.8170", // Imphal coordinates
      "longitude": "93.9368"
    },
    "openingHours": [
      "Mo-Su 06:00-23:00"
    ],
    "priceRange": "₹",
    "servesCuisine": "Grocery",
    "serviceArea": [
      {
        "@type": "State",
        "name": "Manipur"
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
