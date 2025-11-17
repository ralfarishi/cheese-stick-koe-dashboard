"use server";

import { cache } from "react";
import { createClient } from "@/lib/actions/supabase/server";

export const getAllSizePrice = cache(async (sortOrder = "asc") => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ProductSizePrice")
    .select("id, size, price, createdAt")
    .order("size", { ascending: sortOrder === "asc" });

  return { data, error };
});
