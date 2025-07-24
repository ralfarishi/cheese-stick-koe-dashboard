"use server";

import { supabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export async function deleteSize(sizeId) {
	const supabase = await supabaseServer();

	try {
		const { error } = await supabase.from("ProductSizePrice").delete().match({ id: sizeId });

		if (error) {
			console.error("❌ Supabase delete error:", error);
			return { success: false, message: "Failed to delete size" };
		}

		revalidatePath("/dashboard/size-pricing");

		return { success: true };
	} catch (err) {
		console.log(err);
		return { success: false, message: "Failed to delete size" };
	}
}
