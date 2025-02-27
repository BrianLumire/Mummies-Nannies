"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/supabase/client"; // Adjust path as needed

export interface NannyData {
  id: string;
  location: string | null;
  work_type: string | null; // allow null
  religion: string | null;  // allow null
  tribe: string | null;     // allow null
  nationality: string | null;
  rating: number | null;    // allow null
  is_available: boolean;
  // Optionally include education_level if your data returns it:
  education_level?: "high_school" | "associate" | "bachelor" | "master" | "doctorate" | null;
  // Joined fields:
  user_accounts: {
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
  } | null;
  // Updated salary_ranges to allow null
  salary_ranges?: { label: string } | null;
  _nanniesToServices?: Array<{
    nanny_services: {
      label: string;
    };
  }>;
  contact_persons?: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
}

export function useNanny() {
  const params = useParams();
  // params.id can be string | string[] | undefined.
  // If it's an array, take the first element.
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
          *,
          user_accounts (full_name, avatar_url, phone),
          salary_ranges (label),
          _nanniesToServices (nanny_services (label)),
          contact_persons (name, phone, relationship)
          `
        )
        .eq("id", id!)
        .single();
      if (error) {
        setError(error.message);
      } else {
        setNannyData(data);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  return { nannyData, loading, error };
}
