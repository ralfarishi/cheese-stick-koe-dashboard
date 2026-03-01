import { unauthorized } from "next/navigation";

import InvoicePage from "./_components/list/InvoicePage";
import { verifySession } from "@/lib/verifySession";
import { getAllInvoice } from "@/lib/actions/invoice/getAllInvoice";

interface PageProps {
	searchParams: Promise<{
		page?: string;
		query?: string;
		sortOrder?: string;
	}>;
}

export default async function InvoicesPage({ searchParams }: PageProps) {
	const [user, params] = await Promise.all([verifySession(), searchParams]);

	if (!user) {
		unauthorized();
	}

	const page = Number(params?.page) || 1;
	const query = params?.query || "";
	const sortOrder = params?.sortOrder || "desc";

	const {
		data: invoices,
		totalPages,
		count,
		error,
	} = await getAllInvoice({
		page,
		limit: 10,
		query,
		sortOrder: sortOrder as "asc" | "desc",
	});

	if (error) {
		// Error handled silently - page shows empty state
	}

	return (
		<InvoicePage invoices={invoices || []} totalPages={totalPages || 0} totalCount={count || 0} />
	);
}

