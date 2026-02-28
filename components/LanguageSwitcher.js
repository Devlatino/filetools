"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeNames, localeFlags } from "@/i18n.js";

const STORAGE_KEY = "NEXT_LOCALE";

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const handleSelect = useCallback(
    (newLocale) => {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, newLocale);
        } catch (_) {}
      }
      setIsOpen(false);
      router.replace(pathname, { locale: newLocale });
    },
    [pathname, router]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Desktop: dropdown with flags */}
      <div className="hidden sm:block">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:border-sky-400/50 hover:text-sky-200"
          aria-label="Select language"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <span aria-hidden>{localeFlags[currentLocale] || "🌐"}</span>
          <span className="max-w-[5rem] truncate sm:max-w-none">
            {localeNames[currentLocale] ?? currentLocale}
          </span>
          <svg
            className="h-3.5 w-3.5 text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute right-0 top-full z-[60] pt-1">
            <div className="min-w-[11rem] rounded-xl border border-white/10 bg-slate-900 py-1 shadow-xl">
              {locales.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-sky-500/20 hover:text-sky-100 ${
                    loc === currentLocale
                      ? "bg-sky-500/10 text-sky-200"
                      : "text-slate-200"
                  }`}
                >
                  <span aria-hidden>{localeFlags[loc] || "🌐"}</span>
                  {localeNames[loc] ?? loc}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile: native select */}
      <div className="sm:hidden">
        <select
          value={currentLocale}
          onChange={(e) => handleSelect(e.target.value)}
          className="rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 focus:border-sky-400/50 focus:outline-none focus:ring-1 focus:ring-sky-400/50"
          aria-label="Select language"
        >
          {locales.map((loc) => (
            <option key={loc} value={loc}>
              {localeFlags[loc]} {localeNames[loc] ?? loc}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
