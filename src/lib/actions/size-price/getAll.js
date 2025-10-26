"use server";

import { createClient } from "@/lib/actions/supabase/server";

export async function getAllSizePrice(sortOrder = "asc") {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ProductSizePrice")
    .select("id, size, price, createdAt")
    .order("size", { ascending: sortOrder === "asc" });

  return { data, error };
}
