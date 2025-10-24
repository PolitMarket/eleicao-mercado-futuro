import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMarkets = () => {
  return useQuery({
    queryKey: ["markets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("markets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};
