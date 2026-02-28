"use client";

import { useTranslations } from "next-intl";

/**
 * Sezione FAQ visibile in fondo alla pagina tool.
 * Se namespace è fornito, le FAQ sono lette dalle traduzioni (faq1Q, faq1A, ... faq5Q, faq5A).
 * Altrimenti si usa l'array faqs (fallback, es. da getToolFaq).
 * @param {{ namespace?: string, faqs?: { question: string, answer: string }[] }} props
 */
export function FaqSection({ namespace, faqs: faqsProp }) {
  const tCommon = useTranslations("common");
  const t = useTranslations(namespace || "common");

  const faqs = (() => {
    if (namespace) {
      const list = [];
      for (let i = 1; i <= 12; i++) {
        try {
          const q = t(`faq${i}Q`);
          const a = t(`faq${i}A`);
          // Skip if translation is missing (next-intl may return the key path as string)
          if (!q || !a || (typeof q === "string" && q.includes(".faq")) || (typeof a === "string" && a.includes(".faq"))) break;
          list.push({ question: q, answer: a });
        } catch {
          break;
        }
      }
      if (list.length) return list;
    }
    return faqsProp ?? [];
  })();

  if (!faqs?.length) return null;

  const heading = tCommon("faqSectionTitle");

  return (
    <section
      id="faq"
      className="rounded-2xl border border-white/10 bg-slate-900/40 py-8 sm:py-10"
      aria-labelledby="faq-heading"
    >
      <h2
        id="faq-heading"
        className="mb-6 px-1 text-lg font-semibold text-slate-50 sm:text-xl"
      >
        {heading}
      </h2>
      <dl className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-xl border border-white/10 bg-slate-900/60 p-4"
          >
            <dt className="font-medium text-slate-50">
              {faq.question}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-slate-300">
              {faq.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
