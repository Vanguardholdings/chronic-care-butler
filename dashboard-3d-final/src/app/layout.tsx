import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "HealthVault 3D — Immersive Healthcare Dashboard",
  description:
    "A fully immersive 3D healthcare dashboard built with Next.js, Three.js, and GSAP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className={`${inter.className} antialiased bg-dark-950 text-white`}>
        {children}
      </body>
    </html>
  );
}