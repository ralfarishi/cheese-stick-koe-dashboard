"use server";

import { createClient } from "@/lib/actions/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateInvoiceStatus(invoiceId, status) {
	const supabase = await createClient();

	try {
		const { error } = await supabase.from("Invoice").update({ status }).eq("id", invoiceId);

		if (error) {
			throw error;
		}

		revalidatePath("/dashboard/invoices");
		return { success: true };
	} catch (err) {
		return { success: false, error: err.message };
	}
}
