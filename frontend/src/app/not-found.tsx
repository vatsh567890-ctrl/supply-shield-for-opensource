import Link from "next/link";
import { ShieldX, Home } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 text-white">
      <div className="max-w-md w-full rounded-3xl bg-[#0D0B26]/90 border border-[rgba(138,132,196,0.3)] p-8 text-center backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(108,99,255,0.15)]">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/[0.05] border border-[rgba(138,132,196,0.3)] flex items-center justify-center text-[#7CF5FF] shadow-[0_0_20px_rgba(108,99,255,0.2)]">
          <ShieldX className="w-7 h-7" />
        </div>
        <h1 className="font-display text-5xl font-extrabold text-white mb-2 tracking-tight">
          404
        </h1>
        <h2 className="font-display text-lg font-bold text-[#A39EC8] mb-3">
          Endpoint Not Located
        </h2>
        <p className="text-sm text-[#716C9B] mb-6 leading-relaxed">
          The requested path is not registered in the SupplyShield routing perimeter.
        </p>
        <Link href="/">
          <Button variant="glow" className="inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span>Return to Perimeter</span>
          </Button>
        </Link>
      </div>
    </main>
  );
}
