import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "MedChain — Decentralized AI-Powered Medical Records",
  description:
    "A blockchain-backed, AI-enhanced medical record system for India. Tamper-proof health history, owned by patients, queryable by verified doctors.",
  keywords: [
    "medical records",
    "blockchain",
    "healthcare",
    "AI",
    "ABHA",
    "India",
    "Hyperledger Fabric",
  ],
  openGraph: {
    title: "MedChain — Decentralized Medical Records",
    description:
      "Blockchain-backed, AI-enhanced medical record system for India",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-surface-900 text-white`}
      >
        {children}
      </body>
    </html>
  );
}
