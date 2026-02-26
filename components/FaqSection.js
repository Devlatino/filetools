/**
 * Sezione FAQ visibile in fondo alla pagina tool.
 * @param {{ question: string, answer: string }[]} faqs - Array di 5 domande e risposte
 */
export function FaqSection({ faqs }) {
  if (!faqs?.length) return null;

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
          Frequently asked questions
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
