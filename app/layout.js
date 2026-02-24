import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://fileflip.it"
  ),
  title: {
    default: "FileFlip — Tool gratuiti per convertire e comprimere file",
    template: "%s — FileFlip",
  },
  description:
    "Converti e comprimi file online gratis: immagini, PDF, ZIP. Nessun account, tutto nel browser. Comprimi immagini, unisci PDF, converti formati.",
  openGraph: {
    siteName: "FileFlip",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
