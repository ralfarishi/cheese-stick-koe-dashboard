import Link from "next/link";
import { ChevronRight, Receipt } from "lucide-react";

export default function CreateInvoiceHeader() {
	return (
		<div className="mb-8">
			{/* Breadcrumbs Mobile */}
			<div className="block md:hidden mb-4">
				<nav className="flex items-center gap-2 text-sm mt-6">
					<Link
						href="/dashboard/invoices"
						className="text-gray-500 hover:text-[#8B2E1F] transition-colors"
					>
						List Invoice
					</Link>
					<ChevronRight className="w-4 h-4 text-gray-400" />
					<span className="text-[#8B2E1F] font-semibold">Create Invoice</span>
				</nav>
			</div>

			{/* Page Title */}
			<div className="bg-[#8B2E1F] rounded-2xl p-6 md:p-8 shadow-xl">
				<div className="flex items-center gap-4">
					<div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
						<Receipt className="w-8 h-8 text-white" />
					</div>
					<div>
						<h1 className="text-3xl md:text-4xl font-bold text-white">Create New Invoice</h1>
						<p className="text-white/80 text-sm mt-1">
							Fill in the details to generate a new invoice
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
