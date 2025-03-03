"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/supabase/client";

export interface NannyData {
  id: string;
  location: string | null;
  work_type: "full_time" | "dayburg" | null;
  religion: "christian" | "islam" | "hindu" | "pagan" | "non_religious" | null;
  tribe: string | null; // Will hold the tribe label after transformation.
  nationality: string | null;
  rating: number | null;
  is_available: boolean;
  education_level?: "high_school" | "associate" | "bachelor" | "master" | "doctorate" | null;
  years_of_experience?: number | null;
  preferred_kids_count?: string | null; // Transformed from an array if necessary.
  preferred_age_group?: string | null;   // Transformed from an array if necessary.
  nanny_services?: string[]; // Expecting an array of strings.
  user_accounts: {
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
  } | null;
  salary_ranges?: { label: string } | null;
  contact_persons?: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
}

export function useNanny() {
  const params = useParams();
  const idParam = params?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const [nannyData, setNannyData] = useState<NannyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No id provided");
      setLoading(false);
      return;
    }
    const supabase = createClient();
    async function fetchData() {
      const { data, error } = await supabase
        .from("nannies")
        .select(
          `
          id,
          location,
          work_type,
          religion,
          nationality,
          rating,
          is_available,
          education_level,
          years_of_experience,
          preferred_kids_count,
          preferred_age_group,
          nanny_services,
          user_accounts ( full_name, avatar_url, phone ),
          salary_ranges ( label ),
          tribe:tribes ( label ),
          contact_persons ( name, phone, relationship )
          `
        )
        .eq("id", id!)
        .single();

      if (error) {
        setError(error.message);
      } else if (data) {
        // Transform the joined fields:
        const transformed: NannyData = {
          ...data,
          tribe: data.tribe ? data.tribe.label : "N/A",
          preferred_kids_count: Array.isArray(data.preferred_kids_count)
            ? data.preferred_kids_count.join(", ")
            : data.preferred_kids_count || null,
          preferred_age_group: Array.isArray(data.preferred_age_group)
            ? data.preferred_age_group.join(", ")
            : data.preferred_age_group || null,
          // Ensure nanny_services is an array (defaulting to an empty array if null)
          nanny_services: data.nanny_services ?? [],
        };
        setNannyData(transformed);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  return { nannyData, loading, error };
}
