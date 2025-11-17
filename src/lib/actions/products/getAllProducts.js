"use server";

import { cache } from "react";
import { createClient } from "@/lib/actions/supabase/server";

export const getAllProducts = cache(async (sortOrder = "asc") => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Product")
    .select("id, name, description, createdAt")
    .order("name", { ascending: sortOrder === "asc" });

  return { data, error };
});
