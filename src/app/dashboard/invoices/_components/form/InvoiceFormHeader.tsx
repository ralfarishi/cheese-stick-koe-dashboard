"use client";

import Link from "next/link";
import { ChevronRight, Receipt } from "lucide-react";

interface InvoiceFormHeaderProps {
	title?: string;
	subtitle?: string;
}

/**
 * InvoiceFormHeader - Page header with breadcrumb and title
 */
export default function InvoiceFormHeader({
	title = "Update Invoice",
	subtitle,
}: InvoiceFormHeaderProps) {
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
					<span className="text-[#8B2E1F] font-semibold">{title}</span>
				</nav>
			</div>

			{/* Page Title */}
			<div className="bg-gradient-to-r from-[#8B2E1F] to-[#A63825] rounded-2xl p-6 md:p-8 shadow-xl">
				<div className="flex items-center gap-4">
					<div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl hidden md:flex items-center justify-center">
						<Receipt className="w-8 h-8 text-white" />
					</div>
					<div>
						<h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
						{subtitle && <p className="text-white/80 text-sm mt-1">{subtitle}</p>}
					</div>
				</div>
			</div>
		</div>
	);
}
