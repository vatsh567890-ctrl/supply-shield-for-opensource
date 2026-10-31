import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Anton, Space_Grotesk } from "next/font/google";
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

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Supply Shield | Securing every merge",
  description:
    "Pre-merge defense for open source. Malicious pull request and dependency-update detection, with every verdict explained by SHAP.",
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
      className={`${inter.variable} ${jetbrainsMono.variable} ${anton.variable} ${spaceGrotesk.variable}`}
    >
      <body className="antialiased min-h-screen text-[#1E1A1C] selection:bg-[#4d7cff]/30 selection:text-[#f3f4f8]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
