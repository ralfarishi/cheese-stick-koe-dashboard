"use server";

import { cache } from "react";
import { createClient } from "@/lib/actions/supabase/server";

export const getCustomerStats = cache(async (year) => {
	const supabase = await createClient();

	const { data, error } = await supabase.rpc("get_customer_stats", { year });

	if (error) {
		return [];
	}

	// Initialize all months with 0
	const monthlyCustomers = Array.from({ length: 12 }, (_, i) => {
		const date = new Date(year, i, 1);
		return {
			month: date.toLocaleString("en", { month: "short" }),
			totalCustomer: 0,
		};
	});

	// Merge data from DB
	data.forEach((item) => {
		const monthIndex = monthlyCustomers.findIndex((m) => m.month === item.month);
		if (monthIndex !== -1) {
			monthlyCustomers[monthIndex].totalCustomer = item.total_customer;
		}
	});

	return monthlyCustomers;
});
