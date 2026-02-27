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
      for (let i = 1; i <= 5; i++) {
        try {
          const q = t(`faq${i}Q`);
          const a = t(`faq${i}A`);
          if (q && a) list.push({ question: q, answer: a });
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
      className="border-t border-white/10 bg-slate-950 py-10 sm:py-12"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2
          id="faq-heading"
          className="mb-6 text-lg font-semibold text-slate-50 sm:text-xl"
        >
          {heading}
        </h2>
        <dl className="space-y-5">
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
      </div>
    </section>
  );
}
