import { cache } from "react";
import { createClient } from "@/lib/actions/supabase/server";

export const getInvoiceByNumber = cache(async (invoiceNumber) => {
	const supabase = await createClient();

	const { data: invoice, error } = await supabase
		.from("Invoice")
		.select(
			`
			*,
			items:InvoiceItem(
				id,
				productId,
				sizePriceId,
				quantity,
				discountAmount,
				costPerItem,
				totalCost,
				product:Product(id, name),
				sizePrice:ProductSizePrice(id, price, size)
			)
		`
		)
		.eq("invoiceNumber", invoiceNumber)
		.single();

	if (error) return { error };
	return { data: invoice };
});

export const preloadInvoice = (invoiceNumber) => {
	void getInvoiceByNumber(invoiceNumber);
};

