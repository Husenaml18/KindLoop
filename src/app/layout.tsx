import type { Metadata, Viewport } from "next";
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

export const metadata: Metadata = {
  title: "Kindloop",
  description: "Turn a memory into a gift they'll actually keep.",
  /*
   * The icons come from the files beside this one — `favicon.ico` (16/32/48),
   * `icon.png` and `apple-icon.png` — which Next finds and tags automatically.
   *
   * There is deliberately no `icons` key here. Setting one *replaces* the
   * `icon.*` and `apple-icon.*` conventions rather than adding to them, which
   * silently dropped the 32px and Apple icons the first time round.
   */
  manifest: "/favicon/site.webmanifest",
};

export const viewport: Viewport = {
  /* Matches the manifest, so the browser chrome picks up the same pink. */
  themeColor: "#f56c8d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
