"use server";

import { supabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export async function updateProduct(id, { name, description }) {
	const supabase = await supabaseServer();

	try {
		const { error } = await supabase.from("Product").update({ name, description }).eq("id", id);

		if (error) {
			console.error("❌ Supabase delete error:", error);
			return { success: false, message: "Failed to update product" };
		}

		revalidatePath("/dashboard/products");

		return { success: true };
	} catch (err) {
		console.log(err);
		return { success: false, message: "Failed to update product" };
	}
}
