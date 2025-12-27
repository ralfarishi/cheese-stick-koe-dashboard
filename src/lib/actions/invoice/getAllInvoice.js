"use server";

import { cache } from "react";
import { createClient } from "@/lib/actions/supabase/server";

export const getAllInvoice = cache(
	async ({ page = 1, limit = 10, query = "", sortOrder = "desc" } = {}) => {
		const supabase = await createClient();

		const from = (page - 1) * limit;
		const to = from + limit - 1;

		let dbQuery = supabase
			.from("Invoice")
			.select("id, invoiceNumber, buyerName, totalPrice, invoiceDate, status, createdAt", {
				count: "exact",
			})
			.order("invoiceNumber", { ascending: sortOrder === "asc" })
			.range(from, to);

		if (query) {
			dbQuery = dbQuery.or(`invoiceNumber.ilike.%${query}%,buyerName.ilike.%${query}%`);
		}

		const { data, error, count } = await dbQuery;

		const totalPages = count ? Math.ceil(count / limit) : 0;

		return { data, error, count, totalPages };
	}
);

