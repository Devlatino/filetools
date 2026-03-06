import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { BASE_URL } from "@/lib/constants";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SLUG_TO_ID } from "@/lib/relatedTools";

const TOOL_CATEGORIES = [
  {
    name: "PDF Tools",
    slugs: [
      "compress-pdf", "merge-pdf", "split-pdf", "rotate-pdf",
      "pdf-to-jpg", "pdf-to-png", "pdf-to-text", "png-to-pdf",
      "jpg-to-pdf", "image-to-pdf", "extract-pdf-pages",
      "add-watermark-pdf", "pdf-add-page-numbers", "reorder-pdf-pages",
      "pdf-to-pdfa", "pdf-unlock", "protect-pdf",
    ],
  },
  {
    name: "Image Tools",
    slugs: [
      "compress-image", "resize-image", "crop-image", "jpg-to-png",
      "png-to-jpg", "webp-to-jpg", "jpg-to-webp", "image-to-webp",
      "bmp-to-jpg", "tiff-to-jpg", "heic-to-jpg", "svg-to-png",
      "remove-background", "resize-image-social", "add-text-to-image",
      "favicon-generator", "compare",
    ],
  },
  {
    name: "Video Tools",
    slugs: [
      "gif-to-mp4", "mp4-to-gif", "trim-video", "compress-video",
      "mute-video", "video-speed", "add-audio-to-video", "resize-video",
      "merge-videos", "loop-video",
    ],
  },
  {
    name: "Audio Tools",
    slugs: ["trim-audio", "audio-to-mp3", "video-to-mp3"],
  },
  {
    name: "3D & CAD Tools",
    slugs: ["stl-viewer", "obj-to-stl", "image-to-lithophane", "dxf-viewer"],
  },
  {
    name: "Document Tools",
    slugs: ["word-to-pdf", "excel-to-pdf", "csv-to-pdf"],
  },
  {
    name: "Utility Tools",
    slugs: ["create-zip", "qr-code-generator"],
  },
];

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const pathSegment = "/tools";
  const canonical =
    locale === routing.defaultLocale
      ? `${BASE_URL}${pathSegment}`
      : `${BASE_URL}/${locale}${pathSegment}`;

  const languages = {};
  for (const loc of routing.locales) {
    languages[loc] =
      loc === routing.defaultLocale
        ? `${BASE_URL}${pathSegment}`
        : `${BASE_URL}/${loc}${pathSegment}`;
  }
  languages["x-default"] = `${BASE_URL}${pathSegment}`;

  return {
    title: "All Free Online File Tools",
    description:
      "Browse 56+ free online tools for PDF, image, video, audio, and document conversion. No upload, no registration, works in your browser.",
    alternates: { canonical, languages },
    openGraph: {
      title: "All Free Online File Tools | FileFlip",
      description:
        "Browse 56+ free online tools for PDF, image, video, audio, and document conversion. No upload, no registration, works in your browser.",
      url: canonical,
      siteName: "FileFlip",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "All Free Online File Tools | FileFlip",
      description:
        "Browse 56+ free online tools for PDF, image, video, audio, and document conversion.",
    },
  };
}

export default async function ToolsIndexPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools" });

  const canonical =
    locale === routing.defaultLocale
      ? `${BASE_URL}/tools`
      : `${BASE_URL}/${locale}/tools`;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All Free Online File Tools — FileFlip",
    description:
      "Browse 56+ free online tools for PDF, image, video, audio, and document conversion.",
    url: canonical,
    provider: {
      "@type": "Organization",
      name: "FileFlip",
      url: BASE_URL,
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema).replace(/</g, "\\u003c"),
        }}
      />

      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" prefetch className="flex items-center gap-2">
            <img
              src="/fileflip-logo.svg"
              alt="FileFlip"
              className="h-11 w-auto"
              width={170}
              height={44}
            />
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <Link href="/" className="hover:text-slate-200">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-200">All Tools</span>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          All Free Online Tools
        </h1>
        <p className="mt-3 text-slate-400">
          56+ free tools for PDF, image, video, audio, and document processing — all in your browser.
        </p>

        <div className="mt-10 space-y-12">
          {TOOL_CATEGORIES.map((category) => (
            <section key={category.name}>
              <h2 className="mb-5 text-xl font-semibold text-sky-400 border-b border-white/10 pb-2">
                {category.name}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {category.slugs.map((slug) => {
                  const id = SLUG_TO_ID[slug];
                  if (!id) return null;
                  const label = t(`${id}.label`);
                  const short = t(`${id}.short`);
                  return (
                    <Link
                      key={slug}
                      href={`/tools/${slug}`}
                      className="group rounded-xl border border-white/10 bg-slate-900 p-4 transition hover:border-sky-500/50 hover:bg-slate-800"
                    >
                      <div className="font-medium text-slate-100 group-hover:text-sky-400 transition-colors">
                        {label}
                      </div>
                      <div className="mt-1 text-sm text-slate-400 line-clamp-2">
                        {short}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="mt-16 border-t border-white/10 py-8 text-center text-sm text-slate-500">
        <p>
          &copy; {new Date().getFullYear()} FileFlip — Free Online File Tools
        </p>
      </footer>
    </div>
  );
}
