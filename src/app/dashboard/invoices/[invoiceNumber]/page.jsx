import { unauthorized } from "next/navigation";
import { verifySession } from "@/lib/verifySession";

import UpdateInvoiceForm from "../_components/form/UpdateInvoiceForm";

import { getInvoiceByNumber, preloadInvoice } from "@/lib/actions/invoice/getInvoiceByNumber";
import { createClient } from "@/lib/actions/supabase/server";
import Link from "next/link";

export default async function UpdateInvoicePage(props) {
	const session = await verifySession();

	if (!session) {
		unauthorized();
	}

	const { invoiceNumber } = await props.params;

	if (!invoiceNumber) return <div className="text-red-500">Invoice number not found</div>;

	preloadInvoice(invoiceNumber);

	const supabase = await createClient();

	const [{ data: invoice, error: invoiceError }, { data: products }, { data: sizes }] =
		await Promise.all([
			getInvoiceByNumber(invoiceNumber),
			supabase.from("Product").select("id, name").order("name"),
			supabase.from("ProductSizePrice").select("id, size, price").order("size"),
		]);

	if (invoiceError || !invoice) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center p-4">
				<div className="max-w-md w-full">
					{/* Icon */}
					<div className="flex justify-center mb-6">
						<div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border-4 border-red-100">
							<svg
								className="w-10 h-10 text-red-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>
					</div>

					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-3">Invoice Not Found</h1>
						<p className="text-gray-600 leading-relaxed">
							The invoice you're looking for doesn't exist or has been removed. Please check the
							invoice number and try again.
						</p>
					</div>

					{invoiceError && (
						<div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
							<p className="text-sm text-red-800 font-mono">
								{invoiceError.message || "Unknown error occurred"}
							</p>
						</div>
					)}

					<div className="flex flex-col sm:flex-row gap-3">
						<Link
							href="/dashboard/invoices"
							className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#8B2E1F] text-white rounded-xl font-semibold hover:bg-[#6D2315] transition-colors shadow-sm"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M10 19l-7-7m0 0l7-7m-7 7h18"
								/>
							</svg>
							Back to Invoices
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<UpdateInvoiceForm invoice={invoice} productsData={products || []} sizesData={sizes || []} />
	);
}

