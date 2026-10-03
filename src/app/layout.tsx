import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://science-club.bussscr.example"),
  title: {
    default: "বিউএসএস সাইেন্স ক্লাব — বীর উত্তম শহীদ সমাদ স্কুল অ্যান্ড কলেজ",
    template: "%s | বিউএসএস সাইেন্স ক্লাব",
  },
  description:
    "বীর উত্তম শহীদ সমাদ স্কুল অ্যান্ড কলেজ, রংপুরের অফিসিয়াল সাইেন্স ক্লাব — অর্জন, প্রকল্প, সদস্য, গ্যালারী, রিসোর্স লাইব্রেরি ও সদস্য আবেদন।",
  keywords: [
    "সাইেন্স ক্লাব",
    "বীর উত্তম শহীদ সমাদ",
    "রংপুর",
    "বিজ্ঞান ক্লাব",
    "BUSS Science Club",
  ],
  openGraph: {
    title: "বিউএসএস সাইেন্স ক্লাব",
    description: "কৌতূহলই আমাদের জ্বালানি — বিজ্ঞানের আলোয় আলোকিত প্রজন্ম।",
    type: "website",
    locale: "bn_BD",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#101014" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Noto+Serif+Bengali:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div className="ambient" aria-hidden />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
