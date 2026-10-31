import Link from "next/link";
import { ShieldX, Home } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 text-[#1E1A1C]">
      <div className="max-w-md w-full rounded-2xl bg-white border border-[#F0DCE2] p-8 text-center shadow-[0_1px_2px_rgba(30,26,28,0.04)]">
        <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#FAF4F6] border border-[#F0DCE2] flex items-center justify-center text-[#B8556B]">
          <ShieldX className="w-7 h-7" />
        </div>
        <h1 className="font-display text-5xl font-extrabold text-[#1E1A1C] mb-2 tracking-tight">
          404
        </h1>
        <h2 className="font-display text-lg font-bold text-[#1E1A1C] mb-3">
          Endpoint Not Located
        </h2>
        <p className="text-sm text-[#6E6268] mb-6 leading-relaxed">
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
