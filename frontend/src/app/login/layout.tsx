import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | SupplyShield",
  description: "Sign in to SupplyShield pre-merge security scanner for open-source pull requests.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

