"use server";

import { supabaseServer } from "@/lib/supabaseServer";

export async function getAllInvoice(sortOrder = "asc") {
	const supabase = await supabaseServer();

	const { data, error } = await supabase
		.from("Invoice")
		.select("id, invoiceNumber, buyerName, totalPrice, invoiceDate, status, createdAt")
		.order("invoiceNumber", { ascending: sortOrder === "asc" });

	return { data, error };
}
