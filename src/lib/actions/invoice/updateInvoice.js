"use server";

import { supabaseServer } from "@/lib/supabaseServer";

export async function updateInvoice({ invoiceId, invoiceData, items }) {
	const supabase = await supabaseServer();

	try {
		// is invoice number already exist?
		const { data: existing, error: checkError } = await supabase
			.from("Invoice")
			.select("id")
			.eq("invoiceNumber", invoiceData.invoiceNumber)
			.neq("id", invoiceId) // exclude current invoice number
			.maybeSingle();

		if (checkError) throw checkError;
		if (existing) return { error: "Invoice number already existed!" };

		const { error: invoiceError } = await supabase
			.from("Invoice")
			.update({
				invoiceNumber: invoiceData.invoiceNumber,
				buyerName: invoiceData.buyerName,
				invoiceDate: invoiceData.invoiceDate,
				totalPrice: invoiceData.totalPrice,
				discount: invoiceData.discount,
				shipping: parseInt(invoiceData.shipping) || 0,
				status: invoiceData.status,
			})
			.eq("id", invoiceId);

		if (invoiceError) {
			throw invoiceError;
		}

		const { error: deleteError } = await supabase
			.from("InvoiceItem")
			.delete()
			.eq("invoiceId", invoiceId);

		if (deleteError) {
			throw deleteError;
		}

		// insert new items
		const itemsToInsert = items.map((item) => ({
			invoiceId,
			productId: item.productId,
			sizePriceId: item.sizePriceId,
			quantity: item.quantity,
			subtotal: item.quantity * (item.price || 0) - (item.discountAmount || 0),
			discountAmount: item.discountAmount || 0,
		}));

		const { error: insertError } = await supabase.from("InvoiceItem").insert(itemsToInsert);

		if (insertError) {
			throw insertError;
		}

		return { success: true };
	} catch (err) {
		console.error("Error:", err);
		return { success: false, error: err.message };
	}
}
