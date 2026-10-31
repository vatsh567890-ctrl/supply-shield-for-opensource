import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SupplyShield | Pre-Merge Supply Chain Security",
  description:
    "Pre-merge security scanner for open-source pull requests and dependency updates. Automated static detection and plain-English risk triage.",
  icons: {
    icon: "/shield.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased min-h-screen text-[#1E1A1C] selection:bg-[#B8556B]/20 selection:text-[#1E1A1C]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
