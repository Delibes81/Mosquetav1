import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import RouteShell from "@/components/RouteShell";

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
  title: "Mosqueta | Hogar y Oficina",
  description: "60 años equipando los hogares y corporativos de México.",
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
