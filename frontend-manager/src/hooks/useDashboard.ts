import { useQuery } from "@tanstack/react-query";
import { accountsApi } from "@/api";

export function useManagerDashboard() {
  return useQuery({
    queryKey: ["manager-dashboard"],
    queryFn: async () => {
      const res = await accountsApi.getManagerDashboard();
      return res.data;
    },
  });
}
