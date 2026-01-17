import { unauthorized } from "next/navigation";

import { getPageTitle } from "@/lib/utils";
import { createClient } from "@/lib/actions/supabase/server";

import ProductPage from "./ProductPage";

export const metadata = {
	title: getPageTitle("Products"),
};

import { getAllProducts } from "@/lib/actions/products/getAllProducts";

interface PageProps {
	searchParams: Promise<{
		page?: string;
		query?: string;
		sortOrder?: string;
		sortBy?: string;
	}>;
}

export default async function Page({ searchParams }: PageProps) {
	const supabase = await createClient();

	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		unauthorized();
	}

	const params = await searchParams;
	const page = Number(params?.page) || 1;
	const query = params?.query || "";
	const sortOrder = params?.sortOrder || "asc";
	const sortBy = params?.sortBy || "name";

	const {
		data: initialProducts,
		totalPages,
		count,
	} = await getAllProducts({
		page,
		limit: 10,
		query,
		sortOrder: sortOrder as "asc" | "desc",
		sortBy: sortBy as "name" | "createdAt",
	});

	return (
		<ProductPage
			products={initialProducts || []}
			totalPages={totalPages || 0}
			totalCount={count || 0}
		/>
	);
}

