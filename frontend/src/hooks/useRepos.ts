import { useQuery } from "@tanstack/react-query";
import { fetchRepos } from "@/lib/api/endpoints";

export function useRepos() {
  return useQuery({
    queryKey: ["repos"],
    queryFn: fetchRepos,
  });
}
