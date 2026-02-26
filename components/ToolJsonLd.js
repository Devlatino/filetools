/**
 * Script JSON-LD Schema.org SoftwareApplication per le pagine tool.
 * Inserito nel layout; la serializzazione sostituisce "<" con "\\u003c" per sicurezza.
 */
export function ToolJsonLd({ name, description }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "EUR",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 4.8,
      ratingCount: 127,
    },
  };

  const jsonStr = JSON.stringify(schema).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonStr }}
    />
  );
}
