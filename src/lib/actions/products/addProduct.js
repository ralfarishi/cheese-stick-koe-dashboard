"use server";

import { createClient } from "@/lib/actions/supabase/server";

export async function addProduct({ name, description }) {
	const supabase = await createClient();

	// Check for duplicate name
	const { data: existingProduct } = await supabase
		.from("Product")
		.select("id")
		.ilike("name", name)
		.single();

	if (existingProduct) {
		return { error: { message: "Product with this name already exists" } };
	}

	const { data, error } = await supabase
		.from("Product")
		.insert([{ name, description: description || null }])
		.select()
		.single();
	return { data, error };
}

