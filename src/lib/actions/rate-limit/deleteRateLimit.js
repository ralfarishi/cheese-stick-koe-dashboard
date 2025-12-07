"use server";

import { createClient } from "@/lib/actions/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteRateLimit(identifiers) {
	const supabase = await createClient();

	if (!identifiers || identifiers.length === 0) {
		return { success: false, message: "No items selected" };
	}

	try {
		const { error } = await supabase.from("RateLimit").delete().in("identifier", identifiers);

		if (error) {
			return { success: false, message: "Failed to delete records" };
		}

		revalidatePath("/dashboard/settings/login-attempts");
		return { success: true, message: `Successfully deleted ${identifiers.length} record(s)` };
	} catch (err) {
		return { success: false, message: "An unexpected error occurred" };
	}
}
