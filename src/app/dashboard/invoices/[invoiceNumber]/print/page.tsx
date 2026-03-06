import { unauthorized } from "next/navigation";
import { verifySession } from "@/lib/verifySession";
import { getInvoiceByNumber } from "@/lib/actions/invoice/getInvoiceByNumber";
import ThermalReceipt from "../../_components/preview/ThermalReceipt";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
	params: Promise<{
		invoiceNumber: string;
	}>;
}

export default async function ThermalReceiptPage({ params }: PageProps) {
	const user = await verifySession();

	if (!user) {
		unauthorized();
	}

	const { invoiceNumber } = await params;

	if (!invoiceNumber)
		return <div className="p-8 text-red-500 font-bold">Invoice number not found</div>;

	const { data: invoice, error } = await getInvoiceByNumber(invoiceNumber);

	if (error || !invoice) {
		return (
			<div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 print:hidden">
				<h1 className="text-2xl font-bold mb-4">Invoice Not Found</h1>
				<Link href="/dashboard/invoices">
					<Button>Back to Invoices</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100/50 p-6 flex flex-col items-center print:bg-white print:p-0">
			<ThermalReceipt invoice={invoice} />
		</div>
	);
}
