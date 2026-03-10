"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const FORMSPREE_FORM_ID = "YOUR_FORM_ID";

export default function ContactPage() {
  const locale = useLocale();
  const t = useTranslations("contact");
  const tCommon = useTranslations("common");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" prefetch className="flex items-center gap-2">
            <img
              src="/fileflip-logo.svg"
              alt={tCommon("siteName")}
              className="h-11 w-auto"
              width={170}
              height={44}
            />
            <span className="text-sm text-slate-400">{tCommon("footer.contact")}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-slate-400">
          <Link href="/" className="hover:text-slate-200">
            {tCommon("breadcrumbHome")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-200">{t("title")}</span>
        </nav>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 leading-relaxed text-slate-300">{t("description")}</p>

        <p className="mt-4">
          <a
            href="mailto:info@fileflip.org"
            className="text-sky-400 hover:underline"
          >
            {t("email")}
          </a>
        </p>

        <form
          action={`https://formspree.io/f/${FORMSPREE_FORM_ID}`}
          method="POST"
          className="mt-8 space-y-4"
        >
          <div>
            <label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-slate-200">
              {t("name")}
            </label>
            <input
              id="contact-name"
              type="text"
              name="name"
              required
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder={t("name")}
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-slate-200">
              {t("emailLabel")}
            </label>
            <input
              id="contact-email"
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder={t("emailLabel")}
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-slate-200">
              {t("message")}
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              required
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder={t("message")}
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-sky-600 px-4 py-2 font-medium text-white transition-colors hover:bg-sky-700"
          >
            {t("send")}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-400">{t("responseTime")}</p>
        <p className="mt-2">
          <Link href="/#faq" className="text-sky-400 hover:underline">
            {t("faqLink")}
          </Link>
        </p>
      </main>

      <footer className="mt-16 border-t border-white/10 py-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} FileFlip</p>
      </footer>
    </div>
  );
}
