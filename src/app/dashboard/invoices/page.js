import { unauthorized } from "next/navigation";

import { verifySession } from "@/lib/verifySession";

import InvoicePage from "./InvoicePage";

export default async function InvoicesPage() {
	const session = await verifySession();

	if (!session) {
		unauthorized();
	}

	return <InvoicePage />;
}
