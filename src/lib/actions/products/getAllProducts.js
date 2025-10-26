"use server";

import { createClient } from "@/lib/actions/supabase/server";

export async function getAllProducts(sortOrder = "asc") {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Product")
    .select("id, name, description, createdAt")
    .order("name", { ascending: sortOrder === "asc" });

  return { data, error };
}
