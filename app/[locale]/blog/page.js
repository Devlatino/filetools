import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getAllPosts } from "@/lib/blog";
import { routing } from "@/i18n/routing";
import { BlogShell } from "@/components/BlogShell";
import { ChevronRight } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fileflip.org";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const canonical =
    locale === routing.defaultLocale ? "/blog" : `/${locale}/blog`;
  const languages = {};
  for (const loc of routing.locales) {
    languages[loc] = loc === routing.defaultLocale ? "/blog" : `/${loc}/blog`;
  }
  languages["x-default"] = "/blog";
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
        "@type": "Blog",
        name: t("metaTitle"),
        description: t("metaDescription"),
        url: `${BASE_URL}${canonical}`,
      }),
    },
  };
}

export default async function BlogIndexPage({ params }) {
  const { locale } = await params;
  const posts = getAllPosts(locale);
  const t = await getTranslations({ locale, namespace: "blog" });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/${locale === "en" ? "" : locale}` },
      { "@type": "ListItem", position: 2, name: t("title"), item: `${BASE_URL}/${locale === "en" ? "" : locale}/blog` },
    ],
  };

  return (
    <BlogShell locale={locale}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
            {t("title")}
          </h1>
          <p className="mt-2 text-slate-400">
            {t("metaDescription")}
          </p>
          <ul className="mt-10 space-y-8">
            {posts.map((post) => (
              <li key={post.slug}>
                <article className="group">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block rounded-xl border border-white/10 bg-slate-900/50 p-5 transition hover:border-sky-500/30 hover:bg-slate-800/50"
                  >
                    <h2 className="text-xl font-semibold text-slate-50 group-hover:text-sky-300">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {post.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <time dateTime={post.date}>{post.date}</time>
                      <span>·</span>
                      <span>{post.readTime} {t("minRead")}</span>
                      {post.tags?.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="flex flex-wrap gap-1">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded bg-slate-700/80 px-1.5 py-0.5 text-slate-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </span>
                        </>
                      )}
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-sky-400 group-hover:underline">
                      {t("readMore")}
                      <ChevronRight size={16} />
                    </span>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </BlogShell>
  );
}
