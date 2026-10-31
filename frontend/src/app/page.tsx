import Link from "next/link";
import { ProceduralShield } from "@/components/shield/ProceduralShield";

export const metadata = {
  title: "SupplyShield | Pre-merge security for open source",
  description:
    "Know what a code change does before it merges. SupplyShield checks pull requests and dependency updates for install scripts, hidden network calls, and secret access.",
};

const HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    title: "A change is proposed",
    description: "A pull request or dependency update is opened on GitHub.",
  },
  {
    number: "02",
    title: "The old and new versions are compared",
    description: "Package contents are downloaded and compared without running any code.",
  },
  {
    number: "03",
    title: "You get a score and the reasons",
    description: "A 0 to 100 risk level with specific findings and a short written summary.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Bar */}
      <header className="w-full border-b border-[#F0DCE2]/70 bg-white/60 backdrop-blur-none">
        <div className="max-w-[1120px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-medium text-[#1E1A1C] tracking-tight hover:opacity-90 transition-opacity"
          >
            SupplyShield
          </Link>

          <Link
            href="/login"
            className="text-sm font-medium text-[#6E6268] hover:text-[#B8556B] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1120px] mx-auto px-6 py-12 md:py-20 lg:py-24 space-y-24 md:space-y-32">
        {/* Hero Section */}
        <section aria-label="Hero" className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <div className="space-y-6 max-w-xl">
            <span className="inline-block text-sm font-medium text-[#B8556B] tracking-normal">
              Pre-merge security for open source
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-medium leading-[1.15] text-[#1E1A1C] tracking-tight">
              Know what a code change does before it merges.
            </h1>

            <p className="text-base sm:text-lg text-[#6E6268] leading-[1.6]">
              SupplyShield checks pull requests and dependency updates for install scripts, hidden network calls, and secret access, and explains the risk in plain English.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-5 py-2.5 text-base font-medium rounded-[12px] bg-[#B8556B] hover:bg-[#A2485C] text-white shadow-[0_1px_2px_rgba(30,26,28,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8556B] focus-visible:ring-offset-2 transition-colors cursor-pointer"
              >
                Sign in with GitHub
              </Link>

              <Link
                href="/scan?demo=1"
                aria-label="Scan a pull request (Try a demo scan)"
                className="inline-flex items-center justify-center px-5 py-2.5 text-base font-medium rounded-[12px] bg-white border border-[#F0DCE2] hover:bg-[#FAF4F6] text-[#1E1A1C] shadow-[0_1px_2px_rgba(30,26,28,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8556B] focus-visible:ring-offset-2 transition-colors cursor-pointer"
              >
                Scan a pull request
              </Link>

              <a
                href="#how-it-works"
                className="text-sm font-medium text-[#6E6268] hover:text-[#B8556B] transition-colors"
              >
                How it works
              </a>
            </div>
          </div>

          {/* Right Column: 3D Shield */}
          <div className="flex items-center justify-center w-full">
            <ProceduralShield />
          </div>
        </section>

        {/* Section C: How it works */}
        <section
          id="how-it-works"
          aria-label="How it works"
          className="pt-6 border-t border-[#F0DCE2]"
        >
          <div className="divide-y divide-[#F0DCE2]">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div
                key={step.number}
                className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline"
              >
                <div className="md:col-span-2 text-sm font-mono text-[#B8556B]">
                  {step.number}
                </div>
                <div className="md:col-span-4 text-lg font-medium text-[#1E1A1C] tracking-tight">
                  {step.title}
                </div>
                <div className="md:col-span-6 text-base text-[#6E6268] leading-[1.6]">
                  {step.description}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section D: Two-line statement section */}
        <section
          aria-label="Security guarantee"
          className="pt-10 pb-6 border-t border-[#F0DCE2] text-center space-y-2"
        >
          <p className="text-xl sm:text-2xl font-medium text-[#1E1A1C] tracking-tight">
            SupplyShield never executes the code it checks.
          </p>
          <p className="text-base sm:text-lg text-[#6E6268]">
            Free for public open-source projects.
          </p>
        </section>
      </main>

      {/* Section E: Minimal Footer */}
      <footer className="w-full border-t border-[#F0DCE2]/70 py-6">
        <div className="max-w-[1120px] mx-auto px-6 text-center text-xs text-[#6E6268]">
          SupplyShield 2026
        </div>
      </footer>
    </div>
  );
}
