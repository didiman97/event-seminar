import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { AppLayout } from "@/components/layout/AppLayout";
import fs from "fs";
import path from "path";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Rumah Digital | Kuasai Skill Baru, Akselerasi Karirmu Tanpa Batas",
  description: "Join leading web events, masterclasses, and local offline seminars with interactive certificates and instant ticketing.",
  keywords: "webinars, seminars, ticketing, certificates, online events, next.js, strapi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Load settings dynamically for JSON-LD Structured Schema
  const settingsPath = path.join(process.cwd(), "src", "data", "settings.json");
  let siteName = "Rumah Digital";
  let siteDesc = "Join leading web events, masterclasses, and local offline seminars with interactive certificates and instant ticketing.";
  let logoUrl = "https://seminarverse.com/logo.png"; // Fallback URL

  try {
    if (fs.existsSync(settingsPath)) {
      const settingsData = fs.readFileSync(settingsPath, "utf-8");
      const parsed = JSON.parse(settingsData);
      siteName = parsed.logoText || siteName;
      siteDesc = parsed.heroDescription || siteDesc;
      if (parsed.logoImageUrl) {
        logoUrl = parsed.logoImageUrl.startsWith("http")
          ? parsed.logoImageUrl
          : `https://seminarverse.com${parsed.logoImageUrl}`;
      }
    }
  } catch (err) {
    console.error("Error reading settings for SEO Schema:", err);
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": "https://seminarverse.com",
    "description": siteDesc,
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://seminarverse.com/events?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "url": "https://seminarverse.com",
    "logo": logoUrl,
    "sameAs": [
      "https://facebook.com/seminarverse",
      "https://twitter.com/seminarverse",
      "https://instagram.com/seminarverse"
    ]
  };

  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="min-h-full font-sans antialiased bg-navy-dark text-slate-100">
        <AuthProvider>
          <ToastProvider>
            <AppLayout>{children}</AppLayout>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
