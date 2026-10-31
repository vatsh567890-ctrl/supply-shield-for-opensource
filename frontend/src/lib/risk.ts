export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface RiskPresentation {
  label: string;
  colorClass: string;
  badgeClass: string;
  hex: string;
}

export function calculateRiskLevel(score: number): RiskLevel {
  if (score >= 70) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}

export function getRiskPresentation(level: RiskLevel): RiskPresentation {
  switch (level) {
    case "LOW":
      return {
        label: "Low Risk",
        colorClass: "text-[#34D399] text-green-600",
        badgeClass: "bg-[#34D399]/15 text-[#34D399] border-[#34D399]/40",
        hex: "#34D399",
      };
    case "MEDIUM":
      return {
        label: "Medium Risk",
        colorClass: "text-[#FBBF24] text-amber-600",
        badgeClass: "bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/40",
        hex: "#FBBF24",
      };
    case "HIGH":
      return {
        label: "High Risk",
        colorClass: "text-[#F43F5E] text-red-600",
        badgeClass: "bg-[#F43F5E]/15 text-[#F43F5E] border-[#F43F5E]/40",
        hex: "#F43F5E",
      };
    default:
      return {
        label: "Unknown Risk",
        colorClass: "text-[#8A84C4] text-slate-600",
        badgeClass:
          "bg-white/[0.06] text-[#A39EC8] border-[rgba(138,132,196,0.3)]",
        hex: "#8A84C4",
      };
  }
}
