"use server";

import { createClient } from "@/lib/actions/supabase/server";

export async function addSize({ size, price }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ProductSizePrice")
    .insert([{ size, price }])
    .select()
    .single();
  return { data, error };
}
