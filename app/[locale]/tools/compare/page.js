import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { BlogShell } from "@/components/BlogShell";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { routing } from "@/i18n/routing";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fileflip.org";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "compare" });
  const canonical =
    locale === routing.defaultLocale ? "/tools/compare" : `/${locale}/tools/compare`;
  const languages = {};
  for (const loc of routing.locales) {
    languages[loc] =
      loc === routing.defaultLocale ? "/tools/compare" : `/${loc}/tools/compare`;
  }
  languages["x-default"] = "/tools/compare";
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `${BASE_URL}${canonical}`, languages },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `${BASE_URL}${canonical}`,
    },
    other: {
      "script:ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: t("title"),
        description: t("metaDescription"),
        url: `${BASE_URL}${canonical}`,
      }),
    },
  };
}

export default async function ComparePage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "compare" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const localePrefix = locale === routing.defaultLocale ? "" : `/${locale}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tCommon("breadcrumbHome"), item: `${BASE_URL}${localePrefix || "/"}` },
      { "@type": "ListItem", position: 2, name: t("title"), item: `${BASE_URL}${localePrefix}/tools/compare` },
    ],
  };

  const rows = [
    { key: "filesOnServer", ff: "no", sp: "yes", il: "yes", sq: "yes" },
    { key: "accountRequired", ff: "no", sp: "yes", il: "yes", sq: "no" },
    { key: "watermarksFree", ff: "no", sp: "yes", il: "yes", sq: "no" },
    { key: "dailyLimits", ff: "no", sp: "yes", il: "yes", sq: "no" },
    { key: "pdfTools", ff: "yes", sp: "yes", il: "yes", sq: "no" },
    { key: "imageTools", ff: "yes", sp: "partial", il: "partial", sq: "yes" },
    { key: "gifToMp4", ff: "yes", sp: "no", il: "no", sq: "no" },
    { key: "languages", ff: "nine", sp: "one", il: "multiple", sq: "one" },
    { key: "price", ff: "freeForever", sp: "freemium", il: "freemium", sq: "freeForever" },
  ];

  const cell = (v) => {
    if (v === "yes") return "✅";
    if (v === "no") return "❌";
    if (v === "partial") return t("partial");
    return t(v);
  };

  return (
    <BlogShell locale={locale}>
      <SchemaMarkup
        title={t("metaTitle")}
        description={t("metaDescription")}
        slug="compare"
        locale={locale}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="min-h-screen py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-slate-400">
            {t("intro")}
          </p>
          <div className="mt-10 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-slate-800/50">
                  <th className="p-4 font-semibold text-slate-200"></th>
                  <th className="p-4 font-semibold text-sky-300">FileFlip</th>
                  <th className="p-4 font-semibold text-slate-300">Smallpdf</th>
                  <th className="p-4 font-semibold text-slate-300">ILovePDF</th>
                  <th className="p-4 font-semibold text-slate-300">Squoosh</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="border-b border-white/5">
                    <td className="p-4 text-slate-400">{t(row.key)}</td>
                    <td className="p-4 text-slate-200">{cell(row.ff)}</td>
                    <td className="p-4 text-slate-200">{cell(row.sp)}</td>
                    <td className="p-4 text-slate-200">{cell(row.il)}</td>
                    <td className="p-4 text-slate-200">{cell(row.sq)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-12 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-slate-50">FileFlip</h2>
              <p className="mt-2 text-slate-400">{t("fileflipBlurb")}</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-50">Smallpdf</h2>
              <p className="mt-2 text-slate-400">{t("smallpdfBlurb")}</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-50">ILovePDF</h2>
              <p className="mt-2 text-slate-400">{t("ilovepdfBlurb")}</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-50">Squoosh</h2>
              <p className="mt-2 text-slate-400">{t("squooshBlurb")}</p>
            </section>
            <section className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-6">
              <h2 className="text-xl font-semibold text-sky-200">
                {t("whenToUseFileFlip")}
              </h2>
              <p className="mt-2 text-slate-300">{t("whenToUseBody")}</p>
              <Link
                href="/"
                className="mt-4 inline-flex rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400"
              >
                {t("ctaButton")}
              </Link>
            </section>
          </div>
        </div>
      </main>
    </BlogShell>
  );
}
