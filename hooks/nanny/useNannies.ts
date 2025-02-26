"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";
import { Database } from "@/database.types";

// Extended interface with additional fields
export interface NannyData {
  id: string;
  full_name: string;       // from user_accounts.full_name
  avatar_url: string;      // from user_accounts.avatar_url
  phone: string;           // from user_accounts.phone
  location: string | null; // from nannies.location
  is_available: boolean;
  rating: number | null;
  work_type: Database["public"]["Tables"]["nannies"]["Row"]["work_type"];
  budget_range: string;    // derived from salary_ranges.label
  availablefor: string;    // default value: "Special Needs"
  last_seen: string;       // fixed for unavailable: "Feb 2, 2025 08:45am"
  reason: string;          // fixed for unavailable: "Recently hired"
  offers: string;          // default "N/A"
}

export const useNannies = (availability: "available" | "unavailable") => {
  const [data, setData] = useState<NannyData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNannies = async () => {
      setLoading(true);
      const supabase = createClient();

      // Select specific columns from nannies and join user_accounts and salary_ranges.
      const { data: nanniesData, error: queryError } = await supabase
        .from("nannies")
        .select(`
          id,
          location,
          is_available,
          rating,
          work_type,
          salary_ranges (
            label
          ),
          user_accounts (
            full_name,
            avatar_url,
            phone
          )
        `)
        .eq("is_available", availability === "available" ? true : false);

      if (queryError) {
        setError(queryError.message);
        setData([]);
      } else if (nanniesData) {
        const transformed: NannyData[] = nanniesData.map((nanny: any) => ({
          id: nanny.id,
          full_name: nanny.user_accounts?.full_name || "N/A",
          avatar_url: nanny.user_accounts?.avatar_url || "/admin-assets/profile1.svg",
          phone: nanny.user_accounts?.phone || "",
          location: nanny.location,
          is_available: nanny.is_available,
          rating: nanny.rating,
          work_type: nanny.work_type,
          budget_range: nanny.salary_ranges?.label || "N/A",
          availablefor: "Special Needs",             // Default value
          last_seen: "Feb 2, 2025 08:45am",           // Fixed value for unavailable view
          reason: "Recently hired",                  // Fixed value for unavailable view
          offers: "N/A",                             // Default; update if needed later
        }));
        setData(transformed);
      }
      setLoading(false);
    };

    fetchNannies();
  }, [availability]);

  return { data, loading, error };
};
