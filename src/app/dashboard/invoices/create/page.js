import { unauthorized } from "next/navigation";

import { verifySession } from "@/lib/verifySession";

import CreateInvoicePage from "./CreateInvoicePage";

export default async function Page() {
	const session = await verifySession();

	if (!session) {
		unauthorized();
	}

	return <CreateInvoicePage />;
}
