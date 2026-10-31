import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "@/lib/api/endpoints";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
  });
}
