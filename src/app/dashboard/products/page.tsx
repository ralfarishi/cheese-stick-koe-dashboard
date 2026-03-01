import { unauthorized } from "next/navigation";

import { getPageTitle } from "@/lib/utils";
import { verifySession } from "@/lib/verifySession";

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
	const [user, params] = await Promise.all([verifySession(), searchParams]);

	if (!user) {
		unauthorized();
	}

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

