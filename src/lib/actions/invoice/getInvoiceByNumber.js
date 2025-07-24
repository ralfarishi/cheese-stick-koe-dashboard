import { supabaseServer } from "@/lib/supabaseServer";

export const getInvoiceByNumber = async (invoiceNumber) => {
	const supabase = await supabaseServer();

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
				product:Product(id, name),
				sizePrice:ProductSizePrice(id, price, size)
			)
		`
		)
		.eq("invoiceNumber", invoiceNumber)
		.single();

	if (error) return { error };
	return { data: invoice };
};
