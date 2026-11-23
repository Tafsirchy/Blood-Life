import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n/context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "BLOOD&LIFE (ব্লাড অ্যান্ড লাইফ) — National Emergency Blood Dispatch Network",
  description:
    "Zero-cost digital blood donation and emergency life-saving network across all 64 districts in Bangladesh. Connecting voluntary donors with hospital ICUs in under 20 minutes.",
  keywords: [
    "blood donation",
    "blood and life",
    "blood&life",
    "blood lagbe",
    "ব্লাড অ্যান্ড লাইফ",
    "ব্লাড লাগবে",
    "emergency blood bangladesh",
    "blood donor search",
    "blood bank dhaka",
    "free blood donation",
  ],
  authors: [{ name: "BLOOD&LIFE Network" }],
  openGraph: {
    title: "BLOOD&LIFE (ব্লাড অ্যান্ড লাইফ) — National Emergency Blood Dispatch",
    description:
      "When seconds count, BLOOD&LIFE connects voluntary donors with emergency hospital patients within minutes.",
    url: "https://bloodandlife.org",
    siteName: "BLOOD&LIFE",
    locale: "bn_BD",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=5" },
      { url: "/icon.png?v=5", sizes: "512x512", type: "image/png" },
      { url: "/icon-512.png?v=5", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png?v=5", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col font-sans transition-colors duration-200">
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
