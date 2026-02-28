"use client";

import { useTranslations } from "next-intl";

/**
 * Sezione di testo editoriale tra il tool e le FAQ.
 * Legge editorialTitle e editorialBody dal namespace; se mancano, non renderizza nulla.
 * @param {{ namespace: string }} props
 */
export function EditorialSection({ namespace }) {
  const t = useTranslations(namespace);
  let title;
  let body;
  try {
    title = t("editorialTitle");
    body = t("editorialBody");
  } catch {
    return null;
  }
  if (!title || !body) return null;

  const paragraphs = body.split(/\n\n+/).filter(Boolean);

  return (
    <section
      className="border-t border-white/10 bg-slate-950 py-10 sm:py-12"
      aria-labelledby="editorial-heading"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2
          id="editorial-heading"
          className="mb-4 text-lg font-semibold text-slate-50 sm:text-xl"
        >
          {title}
        </h2>
        <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-300 prose-p:mb-3 prose-p:last:mb-0">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
