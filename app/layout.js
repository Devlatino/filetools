import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { getLocale } from "next-intl/server";
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

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://fileflip.org"
  ),
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
};

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <html lang={locale} dir={dir}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-4903529383886232" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4903529383886232"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        {children}
      </body>
    </html>
  );
}
