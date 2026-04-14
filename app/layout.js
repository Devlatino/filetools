import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { getLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

import { BASE_URL } from "@/lib/constants";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "FileFlip — Free Online File Converter | 80+ Tools",
    template: "%s — FileFlip",
  },
  description:
    "Free browser-based file conversion platform. 80+ tools for PDF, images, video, audio, CAD and 3D files. No server upload, no registration, no watermarks. Works on all devices.",
  openGraph: {
    title: "FileFlip — Free Online File Converter",
    description:
      "80+ free tools for PDF, images, video, audio, CAD. No upload, no registration.",
    url: BASE_URL,
    siteName: "FileFlip",
    type: "website",
    images: [
      {
        url: `${BASE_URL}/og.png`,
        width: 1200,
        height: 630,
        alt: "FileFlip — Free Online File Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@fileflip",
    title: "FileFlip — Free Online File Converter",
    description:
      "80+ free tools for PDF, images, video, audio, CAD. No upload, no registration.",
    images: [`${BASE_URL}/og.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  other: {
    "application-name": "FileFlip",
    keywords:
      "free file converter, pdf converter, image converter, compress pdf, merge pdf, heic to jpg, word to pdf, excel to pdf, remove background, compress image",
    classification: "File Conversion, Online Tools, Utilities",
    rating: "general",
    "revisit-after": "7 days",
    language: "en",
    "ai-content-declaration":
      "Publicly accessible, free tools. AI agents may crawl and reference this content.",
    llms: "https://www.fileflip.org/llms.txt",
  },
  icons: {
    icon: "/fileflip-icon.svg",
    apple: "/fileflip-icon.svg",
  },
  verification: {
    yandex: "987f42d9f3b66eb0",
  },
};

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const dir = "ltr";
  return (
    <html lang={locale} dir={dir}>
      <head>
        <meta name="theme-color" content="#1e40af" />
        {/* Google AdSense & CMP Cookie Consent Loader */}
        <meta name="google-adsense-account" content="ca-pub-4903529383886232" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4903529383886232"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script id="posthog-init" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init Dr qr Ci Br Zr Pr capture calculateEventProperties Ur register register_once register_for_session unregister unregister_for_session Xr getFeatureFlag getFeatureFlagPayload getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync Jr identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset setIdentity clearIdentity get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException captureLog startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty Wr Hr createPersonProfile setInternalOrTestUser Gr Fr tn opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing $r debug ki Yr getPageViewId captureTraceFeedback captureTraceMetric Rr".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('phc_sfSSYgaJsLuD44gEpwFSdo4b9bBcYYW4M3nRcqcvG7eS', {
                api_host: 'https://eu.i.posthog.com',
                defaults: '2026-01-30',
                person_profiles: 'identified_only',
            })
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />


      </body>
    </html>
  );
}
