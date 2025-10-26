"use server";

import { createClient } from "@/lib/actions/supabase/server";

export async function addProduct({ name, description }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("Product")
    .insert([{ name, description: description || null }])
    .select()
    .single();
  return { data, error };
}
