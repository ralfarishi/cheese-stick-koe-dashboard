"use server";

import { supabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export async function updateSize(id, { size, price }) {
	const supabase = await supabaseServer();

	try {
		const { error } = await supabase.from("ProductSizePrice").update({ size, price }).eq("id", id);

		if (error) {
			console.error("❌ Supabase delete error:", error);
			return { success: false, message: "Failed to update size" };
		}

		revalidatePath("/dashboard/size-pricing");

		return { success: true };
	} catch (err) {
		console.log(err);
		return { success: false, message: "Failed to update size" };
	}
}
