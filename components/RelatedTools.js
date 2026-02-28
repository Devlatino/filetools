"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { RELATED_TOOLS, SLUG_TO_ID } from "@/lib/relatedTools";

const ICON_BY_SLUG = {
  "compress-image": "IMG",
  "merge-pdf": "PDF",
  "heic-to-jpg": "HEIC",
};

const BG_BY_SLUG = {
  "compress-image": "bg-sky-500",
  "merge-pdf": "bg-rose-500",
  "heic-to-jpg": "bg-amber-600",
};

export function RelatedTools({ locale, currentSlug }) {
  const tTools = useTranslations("tools");
  const tCommon = useTranslations("common");
  const slugs = RELATED_TOOLS[currentSlug];
  if (!slugs?.length) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-5">
      <h2 className="mb-4 text-base font-semibold text-slate-50 sm:text-lg">
        {tCommon("relatedTools")}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {slugs.map((slug) => {
          const id = SLUG_TO_ID[slug];
          const label = id ? tTools(`${id}.label`) : slug;
          const href = `/${locale}/tools/${slug}`;
          const icon = ICON_BY_SLUG[slug] || "•";
          const iconBg = BG_BY_SLUG[slug] || "bg-slate-500";
          return (
            <Link
              key={slug}
              href={href}
              prefetch
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-3 transition-colors hover:border-sky-400/50 hover:bg-slate-900/80"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-slate-950 ${iconBg}`}
              >
                {icon}
              </div>
              <span className="text-sm font-medium text-slate-100 group-hover:text-sky-200">
                {label}
              </span>
              <span className="ml-auto text-slate-500 group-hover:text-sky-400">
                →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
