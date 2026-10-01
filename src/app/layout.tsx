import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PwaRegister from "./PwaRegister";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Compound Interest Calculator",
  description:
    "Minimal and useful compound interest calculator - Built by Martin Shaw in Manchester, UK",
  applicationName: "Compound Interest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Compound Interest",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#d6dbdc" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={
          inter.className +
          " min-h-[100dvh] h-full antialiased touch-manipulation overflow-x-hidden lg:overflow-hidden"
        }
      >
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
