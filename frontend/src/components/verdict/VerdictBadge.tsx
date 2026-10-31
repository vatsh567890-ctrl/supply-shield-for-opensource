import React from "react";
import { Badge } from "@/components/ui/Badge";

export const VerdictBadge: React.FC<{
  level: "LOW" | "MEDIUM" | "HIGH";
}> = ({ level }) => {
  return <Badge level={level}>{level} RISK</Badge>;
};
