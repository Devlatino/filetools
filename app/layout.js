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
    default: "FileFlip — Free tools to convert and compress files",
    template: "%s — FileFlip",
  },
  description:
    "Convert and compress files online for free: images, PDFs, ZIPs. No account, everything in the browser.",
  openGraph: {
    siteName: "FileFlip",
    images: ["/og.png"],
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
      </body>
    </html>
  );
}
