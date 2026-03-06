import { routing } from "@/i18n/routing";
import { BASE_URL } from "@/lib/constants";

const MAX_DESCRIPTION_LENGTH = 155;

/**
 * Build alternates.languages (absolute URLs) for a given path segment (e.g. "/tools/compress-image").
 * Uses BASE_URL so canonical and hreflang are consistent (same www/non-www).
 * @param {string} pathSegment - Path without locale, e.g. "/tools/compress-image"
 * @returns {{ [locale: string]: string }}
 */
function buildLanguageAlternates(pathSegment) {
  const languages = {};
  for (const loc of routing.locales) {
    const path =
      loc === routing.defaultLocale
        ? pathSegment
        : `/${loc}${pathSegment}`;
    languages[loc] = `${BASE_URL}${path}`;
  }
  languages["x-default"] =
    routing.defaultLocale === "en"
      ? `${BASE_URL}${pathSegment}`
      : `${BASE_URL}/en${pathSegment}`;
  return languages;
}

/**
 * Genera l'oggetto metadata completo per una pagina tool Next.js.
 * @param {Object} opts
 * @param {string} opts.locale - Locale (en, it, es, ...)
 * @param {string} opts.toolPath - Segmento path del tool (es. "compress-image")
 * @param {string} opts.title - Titolo dalla traduzione (formato "[Azione] [Formato] Online Gratis" o equivalente)
 * @param {string} opts.description - Descrizione dalla traduzione (verrà troncata a 155 caratteri)
 * @param {string} [opts.keywords] - Meta keywords separate da virgola
 */
export function buildToolMetadata({ locale, toolPath, title, description, keywords }) {
  const pathSegment = `/tools/${toolPath}`;
  const canonical =
    locale === routing.defaultLocale
      ? `${BASE_URL}${pathSegment}`
      : `${BASE_URL}/${locale}${pathSegment}`;
  const fullTitle = title.includes("— FileFlip") ? title : `${title} — FileFlip`;
  const pageTitle = title.includes("— FileFlip") ? title.replace(/\s*—\s*FileFlip\s*$/, "").trim() : title;
  const shortDesc =
    description.length > MAX_DESCRIPTION_LENGTH
      ? description.slice(0, MAX_DESCRIPTION_LENGTH - 3).trim() + "..."
      : description;

  return {
    title: pageTitle,
    description: shortDesc,
    ...(keywords && { keywords }),
    alternates: {
      canonical,
      languages: buildLanguageAlternates(pathSegment),
    },
    openGraph: {
      title: fullTitle,
      description: shortDesc,
      url: canonical,
      type: "website",
      images: [
        {
          url: `${BASE_URL}/api/og?title=${encodeURIComponent(pageTitle)}&description=${encodeURIComponent(shortDesc)}`,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description: shortDesc,
    },
  };
}
