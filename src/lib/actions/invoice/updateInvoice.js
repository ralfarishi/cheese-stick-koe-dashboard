"use server";

import { createClient } from "@/lib/actions/supabase/server";

export async function updateInvoice({ invoiceId, invoiceData, items }) {
	const supabase = await createClient();

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

		// Prepare data for RPC
		const invoicePayload = {
			invoiceNumber: invoiceData.invoiceNumber,
			buyerName: invoiceData.buyerName,
			invoiceDate: new Date(invoiceData.invoiceDate).toISOString(),
			shipping: parseInt(invoiceData.shipping) || 0,
			discount: invoiceData.discount,
			totalPrice: invoiceData.totalPrice,
			status: invoiceData.status,
		};

		const itemsPayload = items.map((item) => ({
			productId: item.productId,
			sizePriceId: item.sizePriceId,
			quantity: item.quantity,
			subtotal: item.quantity * (item.price || 0) - (item.discountAmount || 0),
			discountAmount: item.discountAmount || 0,
		}));

		// Call RPC
		const { error: rpcError } = await supabase.rpc("update_invoice", {
			invoice_id: invoiceId,
			invoice_data: invoicePayload,
			items_data: itemsPayload,
		});

		if (rpcError) {
			throw rpcError;
		}

		return { success: true };
	} catch (err) {
		return { success: false, error: err.message };
	}
}

