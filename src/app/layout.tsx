import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { ThemeProvider } from "@/components/theme";
import FixedLogoOverlays from "@/components/fixed-logo-overlays";
import { getSiteFont } from "@/lib/branding-config";
import { getBranding } from "@/lib/settings";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBranding();
  const description = `${branding.schoolName}, রংপুরের অফিসিয়াল ${branding.clubName} — অর্জন, প্রকল্প, সদস্য, গ্যালারী, রিসোর্স লাইব্রেরি ও সদস্য আবেদন।`;
  const metadata: Metadata = {
    title: {
      default: `${branding.clubName} — ${branding.schoolName}`,
      template: `%s | ${branding.clubName}`,
    },
    description,
    keywords: [
      "সাইেন্স ক্লাব",
      "বীর উত্তম শহীদ সমাদ",
      "রংপুর",
      "বিজ্ঞান ক্লাব",
      "BUSS Science Club",
    ],
    openGraph: {
      title: branding.clubName,
      description: "কৌতূহলই আমাদের জ্বালানি — বিজ্ঞানের আলোয় আলোকিত প্রজন্ম।",
      type: "website",
      locale: "bn_BD",
    },
  };

  if (branding.clubLogo) {
    metadata.icons = {
      icon: branding.clubLogo,
      shortcut: branding.clubLogo,
      apple: branding.clubLogo,
    };
  }

  return metadata;
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#101014" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const branding = await getBranding();
  const siteFont = getSiteFont(branding.siteFont);
  const fontVariables = {
    "--site-font-sans": siteFont.css,
    "--site-font-display": siteFont.css,
  } as CSSProperties;

  return (
    <html lang="bn" suppressHydrationWarning style={fontVariables}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;500;600;700;800&family=Hind+Siliguri:wght@300;400;500;600;700&family=Noto+Sans+Bengali:wght@300;400;500;600;700;800&family=Noto+Serif+Bengali:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div className="ambient" aria-hidden />
          {children}
          <FixedLogoOverlays placements={branding.fixedLogos} />
        </ThemeProvider>
      </body>
    </html>
  );
}
