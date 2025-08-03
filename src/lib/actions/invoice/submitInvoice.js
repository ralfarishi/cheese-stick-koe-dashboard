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
	if (!invoiceNumber || !buyerName || items.length === 0) {
		toast.error("These fields are required!");
		return;
	}

	const supabase = supabaseBrowser();

	// Cek duplikat nomor invoice
	const { data: existing } = await supabase
		.from("Invoice")
		.select("id")
		.eq("invoiceNumber", invoiceNumber)
		.single();

	if (existing) {
		toast.error("Invoice number already existed!");
		return;
	}

	// Simpan invoice
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
				userId: user?.id,
			},
		])
		.select()
		.single();

	if (invoiceError || !invoice) {
		console.error(invoiceError);
		toast.error("Failed to create invoice");
		return;
	}

	// Simpan item
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
		console.error(itemError);
		toast.error("Failed to save invoice item");
		return;
	}

	toast.success("Invoice has been created");

	// Reset form dari luar
	if (onReset) onReset();
};
