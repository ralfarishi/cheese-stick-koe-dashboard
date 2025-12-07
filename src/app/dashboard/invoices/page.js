import { unauthorized } from "next/navigation";

import InvoicePage from "./_components/InvoicePage";
import { createClient } from "@/lib/actions/supabase/server";
import { getAllInvoice } from "@/lib/actions/invoice/getAllInvoice";

export default async function InvoicesPage({ searchParams }) {
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
		sortOrder,
	});

	if (error) {
		// Error handled silently - page shows empty state
	}

	return (
		<InvoicePage invoices={invoices || []} totalPages={totalPages || 0} totalCount={count || 0} />
	);
}

