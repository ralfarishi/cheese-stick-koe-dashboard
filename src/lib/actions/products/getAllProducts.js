"use server";

import { supabaseServer } from "@/lib/supabaseServer";

export async function getAllProducts(sortOrder = "asc") {
	const supabase = await supabaseServer();

	const { data, error } = await supabase
		.from("Product")
		.select("id, name, description, createdAt")
		.order("name", { ascending: sortOrder === "asc" });

	return { data, error };
}
