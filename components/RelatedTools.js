"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Image, FileText, Video, FileArchive, Type, ArrowRight, Maximize2, FileImage, FileOutput, FilePlus, FileDown, Scissors, RotateCw, Film, Crop, FileSearch, Stamp, Archive, Music, FileVideo, VolumeX, Gauge, AudioLines, RectangleHorizontal, ListVideo, Repeat, Eraser, LayoutTemplate } from "lucide-react";
import { RELATED_TOOLS, SLUG_TO_ID } from "@/lib/relatedTools";

/** Icon component by tool slug: image tools, PDF, video, archive, text. */
const ICON_BY_SLUG = {
  "compress-image": Image,
  "merge-pdf": FileText,
  "heic-to-jpg": Image,
  "resize-image": Maximize2,
  "jpg-to-png": FileImage,
  "pdf-to-jpg": FileOutput,
  "png-to-jpg": FileImage,
  "image-to-pdf": FilePlus,
  "compress-pdf": FileDown,
  "webp-to-jpg": FileImage,
  "split-pdf": Scissors,
  "png-to-pdf": FilePlus,
  "jpg-to-pdf": FileOutput,
  "svg-to-png": FileImage,
  "rotate-pdf": RotateCw,
  "image-to-webp": FileImage,
  "pdf-to-png": FileOutput,
  "gif-to-mp4": Film,
  "crop-image": Crop,
  "bmp-to-jpg": FileImage,
  "extract-pdf-pages": FileSearch,
  "tiff-to-jpg": FileImage,
  "add-watermark-pdf": Stamp,
  "mp4-to-gif": Film,
  "jpg-to-webp": FileImage,
  "pdf-to-text": FileText,
  "create-zip": Archive,
  "trim-video": Scissors,
  "video-to-mp3": Music,
  "compress-video": FileVideo,
  "mute-video": VolumeX,
  "video-speed": Gauge,
  "add-audio-to-video": AudioLines,
  "resize-video": RectangleHorizontal,
  "merge-videos": ListVideo,
  "loop-video": Repeat,
  "remove-background": Eraser,
  "resize-image-social": LayoutTemplate,
  "add-text-to-image": Type,
};
const DEFAULT_ICON = Type;

const BG_BY_SLUG = {
  "compress-image": "bg-sky-500",
  "merge-pdf": "bg-rose-500",
  "heic-to-jpg": "bg-amber-600",
  "resize-image": "bg-violet-500",
  "jpg-to-png": "bg-teal-500",
  "pdf-to-jpg": "bg-rose-500",
  "png-to-jpg": "bg-teal-500",
  "image-to-pdf": "bg-rose-500",
  "compress-pdf": "bg-rose-500",
  "webp-to-jpg": "bg-teal-500",
  "split-pdf": "bg-rose-500",
  "png-to-pdf": "bg-rose-500",
  "jpg-to-pdf": "bg-rose-500",
  "svg-to-png": "bg-teal-500",
  "rotate-pdf": "bg-rose-500",
  "image-to-webp": "bg-teal-500",
  "pdf-to-png": "bg-rose-500",
  "gif-to-mp4": "bg-violet-500",
  "crop-image": "bg-violet-500",
  "bmp-to-jpg": "bg-teal-500",
  "extract-pdf-pages": "bg-rose-500",
  "tiff-to-jpg": "bg-teal-500",
  "add-watermark-pdf": "bg-rose-500",
  "mp4-to-gif": "bg-violet-500",
  "jpg-to-webp": "bg-teal-500",
  "pdf-to-text": "bg-rose-500",
  "create-zip": "bg-amber-500",
  "trim-video": "bg-violet-500",
  "video-to-mp3": "bg-pink-500",
  "compress-video": "bg-violet-500",
  "mute-video": "bg-violet-500",
  "video-speed": "bg-violet-500",
  "add-audio-to-video": "bg-pink-500",
  "resize-video": "bg-violet-500",
  "merge-videos": "bg-violet-500",
  "loop-video": "bg-violet-500",
  "remove-background": "bg-teal-500",
  "resize-image-social": "bg-violet-500",
  "add-text-to-image": "bg-sky-500",
};
const DEFAULT_BG = "bg-slate-500";

export function RelatedTools({ locale, currentSlug }) {
  const t = useTranslations();
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
          const label = id ? t(`tools.${id}.label`) : slug;
          const href = `/${locale}/tools/${slug}`;
          const IconComponent = ICON_BY_SLUG[slug] || DEFAULT_ICON;
          const iconBg = BG_BY_SLUG[slug] || DEFAULT_BG;
          return (
            <Link
              key={slug}
              href={href}
              prefetch
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-3 transition-colors hover:border-sky-400/50 hover:bg-slate-900/80"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-950 ${iconBg}`}
              >
                <IconComponent size={18} strokeWidth={2} />
              </div>
              <span className="min-w-0 flex-1 text-sm font-medium text-slate-100 group-hover:text-sky-200 truncate">
                {label}
              </span>
              <ArrowRight size={18} className="shrink-0 text-slate-500 group-hover:text-sky-400" strokeWidth={2} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
