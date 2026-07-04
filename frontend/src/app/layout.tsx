import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const notoSerif = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "번뇌 — Modern Zen AI",
  description: "AI 사이버 스님과 함께하는 멘탈 케어 PWA",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "번뇌",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#065F46",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body
        className={`${notoSerif.variable} ${plusJakarta.variable} h-full overflow-hidden bg-stone-200 font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
