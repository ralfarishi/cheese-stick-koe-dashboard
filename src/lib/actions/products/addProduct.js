"use server";

import { supabaseServer } from "@/lib/supabaseServer";

export async function addProduct({ name, description }) {
	const supabase = await supabaseServer();
	const { data, error } = await supabase
		.from("Product")
		.insert([{ name, description: description || null }])
		.select()
		.single();
	return { data, error };
}
