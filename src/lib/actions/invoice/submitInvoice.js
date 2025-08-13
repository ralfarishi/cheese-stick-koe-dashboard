"use client";

import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { toast } from "sonner";

export const submitInvoice = async ({
	invoiceNumber,
	buyerName,
	invoiceDate,
	shippingPrice,
	discountAmount = 0,
	totalPrice,
	items,
	user,
	onReset,
}) => {
	if (!user) {
		toast.error("User not log in");
		return;
	}

	if (!invoiceNumber.trim() || !buyerName.trim() || items.length === 0) {
		toast.error("Invoice number, buyer name, and at least one item are required!");
		return;
	}

	const supabase = supabaseBrowser();

	// Cek duplikat nomor invoice
	const { data: existing } = await supabase
		.from("Invoice")
		.select("id")
		.eq("invoiceNumber", invoiceNumber)
		.maybeSingle();

	if (existing) {
		toast.error("Invoice number already existed!");
		return;
	}

	// Simpan invoice
	try {
		const { data: invoice, error: invoiceError } = await supabase
			.from("Invoice")
			.insert([
				{
					invoiceNumber,
					buyerName,
					invoiceDate: new Date(invoiceDate),
					shipping: parseInt(shippingPrice) || 0,
					discount: discountAmount,
					totalPrice: totalPrice,
					status: "pending",
					userId: user.id,
				},
			])
			.select()
			.single();

		if (invoiceError || !invoice) {
			throw new Error(invoiceError?.message || "Failed to insert invoice");
		}

		const invoiceItems = items.map((item) => ({
			invoiceId: invoice.id,
			productId: item.productId,
			sizePriceId: item.sizePriceId,
			quantity: item.quantity,
			subtotal: item.total,
			discountAmount: item.discountAmount || 0,
		}));

		const { error: itemError } = await supabase.from("InvoiceItem").insert(invoiceItems);

		if (itemError) {
			throw new Error(itemError.message);
		}

		toast.success("Invoice has been created");

		if (onReset) onReset();
	} catch (err) {
		console.error("Submit invoice error:", err);
		toast.error("Something went wrong while saving invoice");
	}
};
