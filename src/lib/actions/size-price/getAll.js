"use server";

import { cache } from "react";
import { createClient } from "@/lib/actions/supabase/server";

export const getAllSizePrice = cache(
	async ({ page = 1, limit = 10, sortOrder = "asc", sortBy = "size" } = {}) => {
		const supabase = await createClient();

		const from = (page - 1) * limit;
		const to = from + limit - 1;

		const { data, error, count } = await supabase
			.from("ProductSizePrice")
			.select("id, size, price, createdAt", { count: "exact" })
			.order(sortBy, { ascending: sortOrder === "asc" })
			.range(from, to);

		const totalPages = count ? Math.ceil(count / limit) : 0;

		return { data, error, count, totalPages };
	}
);

