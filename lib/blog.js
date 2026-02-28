import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

/**
 * Get all post slugs (from default locale directory; slugs are shared across locales).
 * @returns {string[]}
 */
export function getAllSlugs() {
  const defaultLocaleDir = path.join(BLOG_DIR, "en");
  if (!fs.existsSync(defaultLocaleDir)) return [];
  const files = fs.readdirSync(defaultLocaleDir);
  return files
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/**
 * Get all posts for a locale, sorted by date descending.
 * @param {string} locale
 * @returns {Array<{ slug: string, title: string, description: string, date: string, readTime: string, tags: string[], locale: string, relatedTool?: string, relatedToolLabel?: string }>}
 */
export function getAllPosts(locale) {
  const slugs = getAllSlugs();
  const localeDir = path.join(BLOG_DIR, locale);
  if (!fs.existsSync(localeDir)) return [];

  const posts = [];
  for (const slug of slugs) {
    const filePath = path.join(localeDir, `${slug}.mdx`);
    if (!fs.existsSync(filePath)) continue;
    const source = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(source);
    posts.push({
      slug,
      title: data.title ?? "",
      description: data.description ?? "",
      date: data.date ?? "",
      readTime: data.readTime ?? "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      locale,
      relatedTool: data.relatedTool,
      relatedToolLabel: data.relatedToolLabel,
    });
  }

  posts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return posts;
}

/**
 * Get a single post by slug and locale.
 * @param {string} slug
 * @param {string} locale
 * @returns {{ frontmatter: Record<string, unknown>, content: string } | null}
 */
export function getPostBySlug(slug, locale) {
  const filePath = path.join(BLOG_DIR, locale, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const source = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(source);
  return { frontmatter: data, content };
}
