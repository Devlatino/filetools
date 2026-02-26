/**
 * Script JSON-LD Schema.org FAQPage per le sezioni FAQ delle pagine tool.
 */
export function FaqJsonLd({ faqs }) {
  if (!faqs?.length) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };

  const jsonStr = JSON.stringify(schema).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonStr }}
    />
  );
}
