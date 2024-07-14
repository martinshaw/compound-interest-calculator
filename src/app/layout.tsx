import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Compound Interest Calculator",
  description: "Minimal and useful compound interest calculator - Built by Martin Shaw in Manchester, UK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="lg:overflow-hidden">
      <body className={inter.className + ' lg:overflow-hidden'}>{children}</body>
    </html>
  );
}
