"use server";

import { createClient } from "@/lib/actions/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProduct(id, { name, description }) {
	const supabase = await createClient();

	try {
		// Check for duplicate name (excluding current product)
		const { data: existingProduct } = await supabase
			.from("Product")
			.select("id")
			.ilike("name", name)
			.neq("id", id)
			.single();

		if (existingProduct) {
			return { success: false, message: "Product with this name already exists" };
		}

		const { error } = await supabase.from("Product").update({ name, description }).eq("id", id);

		if (error) {
			return { success: false, message: "Failed to update product" };
		}

		revalidatePath("/dashboard/products");

		return { success: true };
	} catch (err) {
		return { success: false, message: "Failed to update product" };
	}
}

