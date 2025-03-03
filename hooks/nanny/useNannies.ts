"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";
import { Database } from "@/database.types";
import { format } from "date-fns";

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
  availablefor: string;
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

      // Fetch from nannies table joining user_accounts and salary_range (aliased as salary_range)
      const { data: nanniesData, error: queryError } = await supabase
        .from("nannies")
        .select(`
          id,
          location,
          is_available,
          rating,
          work_type,
          nanny_services,
          salary_range:salary_ranges (
            label
          ),
          user_accounts (
            full_name,
            avatar_url,
            phone,
            created_at
          )
        `)
        .eq("is_available", availability === "available");

      if (queryError) {
        setError(queryError.message);
        setData([]);
      } else if (nanniesData) {
        const transformed: NannyData[] = nanniesData.map((nanny: any) => {
          // Build availablefor string from nanny_services array
          const services: string[] = nanny.nanny_services || [];
          const availablefor = services.length > 0 ? services.join(", ") : "N/A";

          // Format last_seen using created_at from user_accounts, if exists
          const createdAt = nanny.user_accounts?.created_at;
          const last_seen = createdAt
            ? format(new Date(createdAt), "MMM d, yyyy hh:mma")
            : "N/A";

          return {
            id: nanny.id,
            full_name: nanny.user_accounts?.full_name || "N/A",
            avatar_url:
              nanny.user_accounts?.avatar_url ||
              "/admin-assets/profile1.svg",
            phone: nanny.user_accounts?.phone || "N/A",
            location: nanny.location || "N/A",
            is_available: nanny.is_available,
            rating: nanny.rating,
            work_type: nanny.work_type,
            budget_range:
              nanny.salary_range?.label || "N/A",
            availablefor,
            last_seen,
            reason: availability === "unavailable" ? "Recently hired" : "N/A",
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
