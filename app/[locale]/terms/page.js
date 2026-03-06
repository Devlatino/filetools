import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { BASE_URL } from "@/lib/constants";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const pathSegment = "/terms";
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
    title: "Terms of Service",
    description:
      "FileFlip terms of service. By using FileFlip, you agree to these terms. Files are processed in your browser and are not stored on our servers.",
    alternates: { canonical, languages },
    openGraph: {
      title: "Terms of Service | FileFlip",
      description:
        "FileFlip terms of service. Files are processed in your browser and are not stored on our servers.",
      url: canonical,
      siteName: "FileFlip",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Terms of Service | FileFlip",
      description:
        "FileFlip terms of service. Files are processed in your browser and are not stored on our servers.",
    },
  };
}

export default async function TermsPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
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

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <Link href="/" className="hover:text-slate-200">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-200">Terms of Service</span>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: March 2026</p>

        <div className="mt-6 space-y-6 leading-relaxed text-slate-300">
          <p>By using FileFlip, you agree to these terms.</p>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">Service</h2>
            <p className="mt-2">
              FileFlip provides free online file conversion tools. Files are processed in
              your browser and are not stored on our servers (except where noted for
              specific tools that require server-side processing).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">No Warranty</h2>
            <p className="mt-2">
              Tools are provided &quot;as is&quot;. We do not guarantee conversion quality or
              availability. FileFlip is not liable for any loss of data or damages arising
              from use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">Acceptable Use</h2>
            <p className="mt-2">
              Do not use FileFlip for illegal purposes or to process files you do not have
              rights to. Do not attempt to disrupt or overload the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">Changes</h2>
            <p className="mt-2">
              We may update these terms at any time. Continued use of FileFlip after
              changes constitutes acceptance of the new terms.
            </p>
          </section>
        </div>
      </main>

      <footer className="mt-16 border-t border-white/10 py-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} FileFlip</p>
      </footer>
    </div>
  );
}
