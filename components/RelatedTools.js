"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { RELATED_TOOLS, SLUG_TO_ID } from "@/lib/relatedTools";

const ICON_BY_SLUG = {
  "compress-image": "IMG",
  "merge-pdf": "PDF",
  "compress-pdf": "PDF",
  "jpg-to-png": "JPG",
  "png-to-jpg": "PNG",
  "image-to-webp": "WBP",
  "resize-image": "SIZE",
  "pdf-to-images": "PDF",
  "create-zip": "ZIP",
  "extract-zip": "ZIP",
};

const BG_BY_SLUG = {
  "compress-image": "bg-sky-500",
  "merge-pdf": "bg-rose-500",
  "compress-pdf": "bg-rose-400",
  "jpg-to-png": "bg-sky-400",
  "png-to-jpg": "bg-indigo-400",
  "image-to-webp": "bg-emerald-400",
  "resize-image": "bg-indigo-500",
  "pdf-to-images": "bg-amber-400",
  "create-zip": "bg-cyan-400",
  "extract-zip": "bg-cyan-500",
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
