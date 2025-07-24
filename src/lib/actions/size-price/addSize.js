"use server";

import { supabaseServer } from "@/lib/supabaseServer";

export async function addSize({ size, price }) {
	const supabase = await supabaseServer();
	const { data, error } = await supabase
		.from("ProductSizePrice")
		.insert([{ size, price }])
		.select()
		.single();
	return { data, error };
}
