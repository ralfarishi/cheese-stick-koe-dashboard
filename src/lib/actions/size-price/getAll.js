"use server";

import { supabaseServer } from "@/lib/supabaseServer";

export async function getAllSizePrice(sortOrder = "asc") {
	const supabase = await supabaseServer();

	const { data, error } = await supabase
		.from("ProductSizePrice")
		.select("id, size, price, createdAt")
		.order("size", { ascending: sortOrder === "asc" });

	return { data, error };
}
