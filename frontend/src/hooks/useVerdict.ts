import { useQuery } from "@tanstack/react-query";
import { fetchVerdict } from "@/lib/api/endpoints";

export function useVerdict(verdictId: string) {
  return useQuery({
    queryKey: ["verdict", verdictId],
    queryFn: () => fetchVerdict(verdictId),
    enabled: !!verdictId,
  });
}
