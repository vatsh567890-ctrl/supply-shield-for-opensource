import { OverviewView } from "@/components/dashboard/OverviewView";

export const metadata = {
  title: "Security Overview | SupplyShield",
  description: "Real-time summary of pull requests and dependency update scans.",
};

export default function OverviewPage() {
  return <OverviewView />;
}
