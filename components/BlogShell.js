"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ChevronUp } from "lucide-react";

export function BlogShell({ locale, children }) {
  const tCommon = useTranslations("common");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="relative z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" prefetch className="flex items-center gap-2">
            <img
              src="/fileflip-logo.svg"
              alt={tCommon("siteName")}
              className="h-11 w-auto"
              width={170}
              height={44}
            />
            <span className="hidden text-xs text-slate-300 sm:inline">
              {tCommon("tagline")}
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <div className="hidden items-center gap-6 text-xs font-medium text-slate-300 sm:flex">
              <Link href="/#tools" className="hover:text-sky-400">
                {tCommon("nav.tools")}
              </Link>
              <Link href="/#come-funziona" className="hover:text-sky-400">
                {tCommon("nav.howItWorks")}
              </Link>
              <Link href="/#faq" className="hover:text-sky-400">
                {tCommon("nav.faq")}
              </Link>
              <Link href="/blog" className="text-sky-400 hover:text-sky-300">
                {tCommon("nav.blog")}
              </Link>
            </div>
            <LanguageSwitcher />
          </nav>
        </div>
      </header>
      {children}
      <footer
        className="border-t border-white/10 text-white"
        style={{ backgroundColor: "#0f172a" }}
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                <img
                  src="/fileflip-logo.svg"
                  alt={tCommon("siteName")}
                  className="h-10 w-auto brightness-0 invert"
                  width={155}
                  height={40}
                />
              </Link>
              <p className="text-sm leading-relaxed text-slate-200">
                {tCommon("footer.description1")}
                <br />
                {tCommon("footer.description2")}
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
                {tCommon("footer.toolsTitle")}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/#tools"
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    {tCommon("footer.allTools")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    {tCommon("nav.blog")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
                {tCommon("footer.companyTitle")}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    {tCommon("footer.privacy")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    {tCommon("footer.terms")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    {tCommon("footer.contact")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sitemap.xml"
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    {tCommon("footer.sitemap")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-300">
            © {new Date().getFullYear()} {tCommon("siteName")} · {tCommon("footer.madeWith")} · {tCommon("footer.processedLocally")}
          </div>
        </div>
      </footer>
      <a
        href="#top"
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-slate-950 shadow-lg hover:bg-sky-400"
        aria-label={tCommon("footer.backToTop")}
      >
        <ChevronUp size={24} strokeWidth={2} />
      </a>
    </div>
  );
}
