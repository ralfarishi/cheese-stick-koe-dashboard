import { unauthorized } from "next/navigation";

import { getPageTitle } from "@/lib/utils";
import { verifySession } from "@/lib/verifySession";

import SizePage from "./SizePage";
import { getAllSizePrice } from "@/lib/actions/size-price/getAll";

export const metadata = {
	title: getPageTitle("Size"),
};

interface PageProps {
	searchParams: Promise<{
		page?: string;
		sortOrder?: string;
		sortBy?: string;
	}>;
}

export default async function page({ searchParams }: PageProps) {
	const session = await verifySession();

	if (!session) {
		unauthorized();
	}

	const params = await searchParams;
	const page = Number(params?.page) || 1;
	const sortOrder = params?.sortOrder || "asc";
	const sortBy = params?.sortBy || "size";

	const {
		data: initialData,
		totalPages,
		count,
	} = await getAllSizePrice({
		page,
		limit: 10,
		sortOrder: sortOrder as "asc" | "desc",
		sortBy: sortBy as "size" | "price" | "createdAt" | "laborPercent",
	});

	return <SizePage data={initialData || []} totalPages={totalPages || 0} totalCount={count || 0} />;
}
