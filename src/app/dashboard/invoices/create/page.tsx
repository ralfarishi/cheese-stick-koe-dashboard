import { unauthorized } from "next/navigation";
import { verifySession } from "@/lib/verifySession";
import CreateInvoicePage from "./CreateInvoicePage";
import { getAllProducts } from "@/lib/actions/products/getAllProducts";
import { getAllSizePrice } from "@/lib/actions/size-price/getAll";
import { db } from "@/db";
import { invoice } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function Page() {
	const user = await verifySession();

	if (!user) {
		unauthorized();
	}

	const [{ data: products }, { data: sizes }, [lastInvoice]] = await Promise.all([
		getAllProducts({ limit: 1000 }),
		getAllSizePrice({ limit: 1000 }),
		db
			.select({ invoiceNumber: invoice.invoiceNumber })
			.from(invoice)
			.orderBy(desc(invoice.invoiceDate))
			.limit(1),
	]);

	return (
		<CreateInvoicePage
			products={products || []}
			sizes={sizes || []}
			lastInvoiceNumber={lastInvoice?.invoiceNumber || null}
			user={user}
		/>
	);
}
