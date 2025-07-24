"use server";

import { supabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export async function updateInvoice(
	id,
	{ invoiceNumber, buyerName, shipping, invoiceDate, status }
) {
	const supabase = await supabaseServer();

	try {
		if (!id) {
			return { success: false, message: "Id invoice not found." };
		}

		const { error } = await supabase
			.from("Invoice")
			.update({ invoiceNumber, buyerName, shipping, invoiceDate, status })
			.eq("id", id);

		if (error) {
			console.error("❌ Supabase update error:", error);
			return { success: false, message: "Failed to update invoice" };
		}

		revalidatePath("/dashboard/invoices");

		return { success: true };
	} catch (err) {
		console.log(err);
		return { success: false, message: "Failed to update invoice" };
	}
}
