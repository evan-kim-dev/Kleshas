import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "번뇌 — Cyber Monk",
  description: "AI 사이버 스님과 함께하는 멘탈 케어",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "번뇌",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${jetbrainsMono.variable} font-mono h-full antialiased`}>
        {children}
      </body>
    </html>
  );
}
