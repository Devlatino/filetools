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
        <meta name="google-adsense-account" content="ca-pub-4903529383886232" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4903529383886232"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        {children}
        <Analytics />

        {/* Adsterra Social Bar */}
        <Script
          src="https://landslidegraphsystems.com/71/4e/42/714e421b016e86c8f81c82d15b7aae4e.js"
          strategy="afterInteractive"
        />

        {/* Adsterra Native Banner */}
        <Script
          src="https://landslidegraphsystems.com/824f4a738212c0f6443b882ebd79139f/invoke.js"
          strategy="afterInteractive"
          data-cfasync="false"
        />
        <div id="container-824f4a738212c0f6443b882ebd79139f"></div>
      </body>
    </html>
  );
}
