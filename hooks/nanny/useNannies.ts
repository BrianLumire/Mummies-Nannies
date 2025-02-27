import { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";
import { Database } from "@/database.types";

export interface NannyData {
  id: string;
  full_name: string;
  avatar_url: string;
  phone: string;
  location: string | null;
  is_available: boolean;
  rating: number | null;
  work_type: Database["public"]["Tables"]["nannies"]["Row"]["work_type"];
  budget_range: string; 
  availablefor: string; // Now dynamically set from the join
  last_seen: string; 
  reason: string; 
  offers: string;
}

export const useNannies = (availability: "available" | "unavailable") => {
  const [data, setData] = useState<NannyData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNannies = async () => {
      setLoading(true);
      const supabase = createClient();

      // Extended query to join _nanniesToServices and then nanny_services
      const { data: nanniesData, error: queryError } = await supabase
        .from("nannies")
        .select(`
          id,
          location,
          is_available,
          rating,
          work_type,
          salary_ranges ( label ),
          user_accounts ( full_name, avatar_url, phone ),
          _nanniesToServices ( 
            nanny_services ( label )
          )
        `)
        .eq("is_available", availability === "available" ? true : false);

      if (queryError) {
        setError(queryError.message);
        setData([]);
      } else if (nanniesData) {
        // Transform each nanny record to include a combined "availablefor" string
        const transformed: NannyData[] = nanniesData.map((nanny: any) => {
          // Extract service labels from the join result
          const services = nanny._nanniesToServices?.map((s: any) => s.nanny_services?.label) || [];
          // Join the labels into a comma-separated string (or adjust as desired)
          const availablefor = services.length > 0 ? services.join(", ") : "N/A";

          return {
            id: nanny.id,
            full_name: nanny.user_accounts?.full_name || "N/A",
            avatar_url: nanny.user_accounts?.avatar_url || "/admin-assets/profile1.svg",
            phone: nanny.user_accounts?.phone || "",
            location: nanny.location,
            is_available: nanny.is_available,
            rating: nanny.rating,
            work_type: nanny.work_type,
            budget_range: nanny.salary_ranges?.label || "N/A",
            availablefor,
            last_seen: "Feb 2, 2025 08:45am",
            reason: "Recently hired",
            offers: "N/A",
          };
        });
        setData(transformed);
      }
      setLoading(false);
    };

    fetchNannies();
  }, [availability]);

  return { data, loading, error };
};
