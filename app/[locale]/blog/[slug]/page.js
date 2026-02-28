import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPostBySlug, getAllPosts, getAllSlugs } from "@/lib/blog";
import { routing } from "@/i18n/routing";
import { BlogShell } from "@/components/BlogShell";
import { ArrowLeft } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fileflip.org";

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  const params = [];
  for (const locale of routing.locales) {
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);
  if (!post) return { title: "Blog" };
  const { frontmatter } = post;
  const canonical =
    locale === routing.defaultLocale ? `/blog/${slug}` : `/${locale}/blog/${slug}`;
  const languages = {};
  for (const loc of routing.locales) {
    languages[loc] =
      loc === routing.defaultLocale ? `/blog/${slug}` : `/${loc}/blog/${slug}`;
  }
  languages["x-default"] = `/blog/${slug}`;
  return {
    title: frontmatter.title,
    description: frontmatter.description,
    alternates: { canonical: `${BASE_URL}${canonical}`, languages },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      url: `${BASE_URL}${canonical}`,
      type: "article",
      publishedTime: frontmatter.date,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);
  if (!post) return null;
  const { frontmatter, content } = post;
  const allPosts = getAllPosts(locale);
  const others = allPosts.filter((p) => p.slug !== slug).slice(0, 3);
  const t = await getTranslations({ locale, namespace: "blog" });

  const localePrefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const blogHref = localePrefix ? `${localePrefix}/blog` : "/blog";
  const toolPath = frontmatter.relatedTool
    ? `/tools/${frontmatter.relatedTool}`
    : null;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: frontmatter.title,
    description: frontmatter.description,
    datePublished: frontmatter.date,
    author: { "@type": "Organization", name: "FileFlip Team" },
    publisher: { "@type": "Organization", name: "FileFlip" },
    url: `${BASE_URL}${locale === routing.defaultLocale ? "" : `/${locale}`}/blog/${slug}`,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}${localePrefix || "/"}` },
      { "@type": "ListItem", position: 2, name: t("title"), item: `${BASE_URL}${blogHref}` },
      { "@type": "ListItem", position: 3, name: frontmatter.title, item: `${BASE_URL}${localePrefix}/blog/${slug}` },
    ],
  };

  return (
    <BlogShell locale={locale}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="min-h-screen py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-8" aria-label="Breadcrumb">
            <Link
              href={blogHref}
              className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-sky-400"
            >
              <ArrowLeft size={16} />
              {t("backToBlog")}
            </Link>
          </nav>
          <article>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
              {frontmatter.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <time dateTime={frontmatter.date}>{frontmatter.date}</time>
              <span>·</span>
              <span>{frontmatter.readTime} {t("minRead")}</span>
              {Array.isArray(frontmatter.tags) && frontmatter.tags.length > 0 && (
                <>
                  <span>·</span>
                  <span className="flex flex-wrap gap-1">
                    {frontmatter.tags.map((tag) => (
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
            <div className="prose prose-invert mt-8 max-w-none prose-headings:text-slate-50 prose-p:text-slate-300 prose-a:text-sky-400 prose-strong:text-slate-200 prose-code:text-sky-300 prose-pre:bg-slate-900">
              <MDXRemote source={content} />
            </div>
            {frontmatter.relatedToolLabel && toolPath && (
              <div className="mt-12 rounded-xl border border-sky-500/30 bg-sky-500/10 p-6">
                <p className="text-sm font-medium text-sky-200">
                  {t("tryTool", { tool: frontmatter.relatedToolLabel })}
                </p>
                <Link
                  href={toolPath}
                  className="mt-3 inline-flex items-center rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400"
                >
                  {frontmatter.relatedToolLabel} →
                </Link>
              </div>
            )}
            {others.length > 0 && (
              <aside className="mt-12 border-t border-white/10 pt-8">
                <h2 className="text-lg font-semibold text-slate-50">
                  {t("relatedArticles")}
                </h2>
                <ul className="mt-4 space-y-2">
                  {others.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/blog/${p.slug}`}
                        className="text-sky-400 hover:underline"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </article>
        </div>
      </main>
    </BlogShell>
  );
}
