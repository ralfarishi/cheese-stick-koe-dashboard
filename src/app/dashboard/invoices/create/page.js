import { unauthorized } from "next/navigation";

import { verifySession } from "@/lib/verifySession";

import CreateInvoicePage from "./CreateInvoicePage";

import { getAllProducts } from "@/lib/actions/products/getAllProducts";
import { getAllSizePrice } from "@/lib/actions/size-price/getAll";

export default async function Page() {
	const session = await verifySession();

	if (!session) {
		unauthorized();
	}

	const [{ data: products }, { data: sizes }] = await Promise.all([
		getAllProducts({ limit: 1000 }),
		getAllSizePrice({ limit: 1000 }),
	]);

	return <CreateInvoicePage products={products || []} sizes={sizes || []} />;
}
