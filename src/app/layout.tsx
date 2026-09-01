import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import RouteShell from "@/components/RouteShell";
import { siteConfig } from '@/lib/site';

const montserrat = localFont({
  src: "./fonts/Montserrat-Latin.woff2",
  variable: "--font-montserrat",
  weight: "100 900",
  display: "swap",
});

const inter = localFont({
  src: "./fonts/Inter-Latin.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteConfig.url,
  title: {
    default: 'Mosqueta | Hogar y Oficina',
    template: '%s | Mosqueta',
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    'electrodomésticos',
    'muebles',
    'equipamiento para el hogar',
    'equipamiento corporativo',
    'Mosqueta México',
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: '/',
    siteName: siteConfig.name,
    title: 'Mosqueta | Hogar y Oficina',
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mosqueta | Hogar y Oficina',
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'shopping',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-inter">
        <RouteShell>{children}</RouteShell>
      </body>
    </html>
  );
}
